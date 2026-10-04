import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Cloud, Database, Server } from "lucide-react";

interface Resource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: string;
  environment: string;
  riskLevel: string;
  source: string;
}

interface CloudMapProps {
  resources: Resource[];
}

interface Line {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const MAX_VISIBLE = 8;

function statusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "active":
    case "healthy":
    case "running":
      return "#22C55E";
    case "warning":
      return "#F59E0B";
    case "critical":
      return "#EF4444";
    default:
      return "#38BDF8"; // available / unknown
  }
}

function riskStyle(risk: string) {
  switch (risk?.toLowerCase()) {
    case "critical":
      return "text-[#EF4444]";
    case "high":
      return "text-[#F59E0B]";
    case "medium":
      return "text-yellow-400";
    default:
      return "text-[#22C55E]";
  }
}

function iconFor(type: string) {
  const t = type?.toLowerCase();
  if (t === "ec2") return Server;
  if (t === "rds") return Database;
  return Cloud;
}

function CloudMap({ resources }: CloudMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [lines, setLines] = useState<Line[]>([]);

  const visible = resources.slice(0, MAX_VISIBLE);

  // Measure the real DOM positions so connectors always match the cards.
  const measure = useCallback(() => {
    const container = containerRef.current;
    const hub = hubRef.current;
    if (!container || !hub) return;

    const c = container.getBoundingClientRect();
    const h = hub.getBoundingClientRect();
    const x1 = h.left + h.width / 2 - c.left;
    const y1 = h.top + h.height / 2 - c.top;

    const next: Line[] = [];
    visible.forEach((r) => {
      const el = cardRefs.current[r.id];
      if (!el) return;
      const b = el.getBoundingClientRect();
      next.push({
        id: r.id,
        x1,
        y1,
        x2: b.left + b.width / 2 - c.left,
        y2: b.top - c.top,
      });
    });
    setLines(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible.map((r) => r.id).join("|")]);

  useLayoutEffect(() => {
    measure();

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <div className="w-full rounded-xl border border-white/10 bg-[#07050F] p-4 sm:p-6">
      {/* Top bar: counter */}
      <div className="flex justify-end">
        <div className="rounded-lg border border-white/10 bg-[#0B0914] px-3 py-2">
          <p className="text-[10px] text-gray-500">Showing</p>
          <p className="text-xs font-semibold text-white">
            {visible.length} / {resources.length} resources
          </p>
        </div>
      </div>

      {/* Map area: height grows with content, nothing is absolutely positioned
          except the SVG connector layer sitting behind the cards. */}
      <div ref={containerRef} className="relative mt-2">
        <svg
          className="pointer-events-none absolute inset-0 z-0 h-full w-full"
          aria-hidden="true"
        >
          {lines.map((l) => (
            <path
              key={l.id}
              d={`M ${l.x1} ${l.y1} C ${l.x1} ${l.y1 + (l.y2 - l.y1) / 2}, ${l.x2} ${l.y2 - (l.y2 - l.y1) / 2}, ${l.x2} ${l.y2}`}
              fill="none"
              stroke="#8B5CF6"
              strokeOpacity="0.35"
              strokeDasharray="4 4"
            />
          ))}
        </svg>

        {/* Hub node */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            ref={hubRef}
            className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#8B5CF6]/40 bg-[#1A1230]"
          >
            <Cloud size={28} className="text-[#A78BFA]" />
          </div>
          <p className="mt-2 text-sm font-semibold text-white">AWS Account</p>
          <p className="text-[11px] text-gray-500">Cloud Environment</p>
        </div>

        {/* Cards: a real grid with a fixed gap, so rows can never overlap */}
        {visible.length === 0 ? (
          <p className="relative z-10 mt-10 text-center text-sm text-gray-500">
            No resources to display
          </p>
        ) : (
          <div className="relative z-10 mt-14 grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((r) => {
              const Icon = iconFor(r.type);
              const color = statusColor(r.status);

              return (
                <div
                  key={r.id}
                  ref={(el) => {
                    cardRefs.current[r.id] = el;
                  }}
                  className="flex min-w-0 flex-col rounded-xl border border-white/10 bg-[#0E0B1B] p-4 transition hover:border-[#8B5CF6]/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#8B5CF6]/10 text-[#A78BFA]">
                      <Icon size={18} />
                    </div>

                    <div className="flex min-w-0 items-center gap-1.5">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate text-[10px] uppercase text-gray-500">
                        {r.status}
                      </span>
                    </div>
                  </div>

                  <p
                    className="mt-3 truncate text-sm font-semibold text-white"
                    title={r.name}
                  >
                    {r.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-600">
                    {r.type} · {r.region}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/5 pt-3">
                    <span className="truncate text-[10px] uppercase text-gray-600">
                      {r.environment || "—"}
                    </span>
                    <span
                      className={`shrink-0 text-[10px] font-bold uppercase ${riskStyle(r.riskLevel)}`}
                    >
                      {r.riskLevel || "low"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend: normal flow below the grid, never on top of a card */}
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-white/10 bg-[#0B0914] px-3 py-2 text-xs text-gray-400 sm:w-fit">
        <span className="text-gray-600">Risk</span>
        <LegendItem color="#22C55E" label="Low" />
        <LegendItem color="#EAB308" label="Medium" />
        <LegendItem color="#F59E0B" label="High" />
        <LegendItem color="#EF4444" label="Critical" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

export default CloudMap;