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
      return "#38BDF8";
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

  const measure = useCallback(() => {
    const container = containerRef.current;
    const hub = hubRef.current;

    if (!container || !hub) return;

    const containerBox = container.getBoundingClientRect();
    const hubBox = hub.getBoundingClientRect();

    const x1 =
      hubBox.left +
      hubBox.width / 2 -
      containerBox.left;

    const y1 =
      hubBox.top +
      hubBox.height / 2 -
      containerBox.top;

    const nextLines: Line[] = [];

    visible.forEach((resource) => {
      const card = cardRefs.current[resource.id];

      if (!card) return;

      const cardBox = card.getBoundingClientRect();

      nextLines.push({
        id: resource.id,
        x1,
        y1,
        x2:
          cardBox.left +
          cardBox.width / 2 -
          containerBox.left,
        y2: cardBox.top - containerBox.top,
      });
    });

    setLines(nextLines);
  }, [visible.map((resource) => resource.id).join("|")]);

  useLayoutEffect(() => {
    measure();

    const container = containerRef.current;

    if (!container) return;

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });

    observer.observe(container);

    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <div className="w-full min-w-0 rounded-xl border border-white/10 bg-[#07050F] p-4 sm:p-6">
      {/* Counter */}
      <div className="flex justify-end">
        <div className="shrink-0 rounded-lg border border-white/10 bg-[#0B0914] px-3 py-2">
          <p className="text-[10px] text-gray-500">
            Showing
          </p>

          <p className="text-xs font-semibold text-white">
            {visible.length} / {resources.length} resources
          </p>
        </div>
      </div>

      {/* Map */}
      <div
        ref={containerRef}
        className="relative mt-4 min-w-0"
      >
        {/* Connector layer */}
        <svg
          className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          {lines.map((line) => {
            const middleY =
              line.y1 +
              (line.y2 - line.y1) / 2;

            return (
              <path
                key={line.id}
                d={`
                  M ${line.x1} ${line.y1}
                  C ${line.x1} ${middleY},
                    ${line.x2} ${middleY},
                    ${line.x2} ${line.y2}
                `}
                fill="none"
                stroke="#8B5CF6"
                strokeOpacity="0.35"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            );
          })}
        </svg>

        {/* AWS Hub */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            ref={hubRef}
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#8B5CF6]/40 bg-[#1A1230]"
          >
            <Cloud
              size={28}
              className="text-[#A78BFA]"
            />
          </div>

          <p className="mt-2 text-sm font-semibold text-white">
            AWS Account
          </p>

          <p className="text-[11px] text-gray-500">
            Cloud Environment
          </p>
        </div>

        {/* Resource Cards */}
        {visible.length === 0 ? (
          <p className="relative z-10 mt-10 text-center text-sm text-gray-500">
            No resources to display
          </p>
        ) : (
          <div className="relative z-10 mt-16 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visible.map((resource) => {
              const Icon = iconFor(resource.type);
              const color = statusColor(resource.status);

              return (
                <div
                  key={resource.id}
                  ref={(element) => {
                    cardRefs.current[resource.id] = element;
                  }}
                  className="flex min-h-[150px] min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0E0B1B] p-4 transition hover:border-[#8B5CF6]/40"
                >
                  {/* Top section */}
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#8B5CF6]/10 text-[#A78BFA]">
                      <Icon size={18} />
                    </div>

                    <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor: color,
                        }}
                      />

                      <span className="max-w-[90px] truncate text-[10px] uppercase text-gray-500">
                        {resource.status}
                      </span>
                    </div>
                  </div>

                  {/* Resource name */}
                  <p
                    className="mt-3 min-w-0 truncate text-sm font-semibold leading-5 text-white"
                    title={resource.name}
                  >
                    {resource.name}
                  </p>

                  {/* Type + region */}
                  <p
                    className="mt-1 min-w-0 truncate text-xs leading-5 text-gray-600"
                    title={`${resource.type} · ${resource.region}`}
                  >
                    {resource.type} · {resource.region}
                  </p>

                  {/* Bottom metadata */}
                  <div className="mt-auto flex min-w-0 items-center justify-between gap-2 border-t border-white/5 pt-3">
                    <span
                      className="min-w-0 truncate text-[10px] uppercase text-gray-600"
                      title={resource.environment || "—"}
                    >
                      {resource.environment || "—"}
                    </span>

                    <span
                      className={`shrink-0 text-[10px] font-bold uppercase ${riskStyle(
                        resource.riskLevel
                      )}`}
                    >
                      {resource.riskLevel || "low"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 flex w-full flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-white/10 bg-[#0B0914] px-3 py-2 text-xs text-gray-400 sm:w-fit">
        <span className="text-gray-600">
          Risk
        </span>

        <LegendItem
          color="#22C55E"
          label="Low"
        />

        <LegendItem
          color="#EAB308"
          label="Medium"
        />

        <LegendItem
          color="#F59E0B"
          label="High"
        />

        <LegendItem
          color="#EF4444"
          label="Critical"
        />
      </div>
    </div>
  );
}

function LegendItem({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{
          backgroundColor: color,
        }}
      />

      {label}
    </span>
  );
}

export default CloudMap;
