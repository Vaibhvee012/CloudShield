import {
  Cloud,
  Database,
  Server,
  Shield,
} from "lucide-react";

interface Resource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: string;
  environment: string;
  riskLevel: string;
}

interface CloudMapProps {
  resources: Resource[];
}

function getIcon(type: string) {
  const normalizedType = type.toLowerCase();

  if (normalizedType.includes("ec2")) {
    return Server;
  }

  if (normalizedType.includes("rds")) {
    return Database;
  }

  return Cloud;
}

function getRiskColor(riskLevel: string) {
  const risk = riskLevel.toLowerCase();

  if (risk === "critical") {
    return "#EF4444";
  }

  if (risk === "high") {
    return "#F59E0B";
  }

  if (risk === "medium") {
    return "#EAB308";
  }

  return "#22C55E";
}

function CloudMap({ resources }: CloudMapProps) {
  const displayedResources = resources.slice(0, 8);

  return (
    <div className="relative mt-5 min-h-[430px] overflow-hidden rounded-xl border border-white/10 bg-[#08070D]">
      {/* Background Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.12) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* SVG Connections */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        {displayedResources.map((_, index) => {
          if (index === 0) {
            return null;
          }

          const previousX = 50 + ((index - 1) % 4) * 16;
          const previousY =
            index - 1 < 4 ? 45 : 68;

          const currentX = 50 + (index % 4) * 16;
          const currentY =
            index < 4 ? 45 : 68;

          return (
            <line
              key={`connection-${index}`}
              x1={`${previousX}%`}
              y1={`${previousY}%`}
              x2={`${currentX}%`}
              y2={`${currentY}%`}
              stroke="rgba(139,92,246,0.35)"
              strokeWidth="1"
              strokeDasharray="5 5"
            />
          );
        })}
      </svg>

      {/* AWS Root */}
      <div className="absolute left-1/2 top-8 -translate-x-1/2">
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
            <Cloud
              size={27}
              className="text-[#A78BFA]"
            />
          </div>

          <p className="mt-2 text-xs font-semibold text-white">
            AWS Account
          </p>

          <p className="text-[10px] text-gray-600">
            Cloud Environment
          </p>
        </div>
      </div>

      {/* Resource Nodes */}
      {displayedResources.map((resource, index) => {
        const Icon = getIcon(resource.type);

        const row = index < 4 ? 0 : 1;
        const column = index % 4;

        const left = 8 + column * 24;
        const top = row === 0 ? 43 : 67;

        const riskColor = getRiskColor(
          resource.riskLevel
        );

        return (
          <div
            key={resource.id}
            className="group absolute w-40 -translate-x-1/2"
            style={{
              left: `${left}%`,
              top: `${top}%`,
            }}
          >
            <div className="rounded-xl border border-white/10 bg-[#0B0914] p-3 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-[#8B5CF6]/50 hover:shadow-[0_0_25px_rgba(139,92,246,0.12)]">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B5CF6]/10">
                  <Icon
                    size={16}
                    className="text-[#A78BFA]"
                  />
                </div>

                <span
                  className="mt-1 h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: riskColor,
                    boxShadow: `0 0 8px ${riskColor}`,
                  }}
                />
              </div>

              <p className="mt-3 truncate text-xs font-semibold text-white">
                {resource.name}
              </p>

              <p className="mt-1 truncate text-[10px] text-gray-600">
                {resource.type} · {resource.region}
              </p>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-[9px] uppercase text-gray-600">
                  {resource.environment}
                </span>

                <span
                  className="text-[9px] font-semibold uppercase"
                  style={{ color: riskColor }}
                >
                  {resource.riskLevel}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Empty State */}
      {resources.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Shield
              size={34}
              className="mx-auto text-gray-600"
            />

            <p className="mt-3 text-sm font-medium text-gray-400">
              No resources discovered
            </p>

            <p className="mt-1 text-xs text-gray-600">
              Connect an AWS account to populate the cloud map.
            </p>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 flex items-center gap-4 rounded-lg border border-white/10 bg-[#0B0914]/90 px-3 py-2 backdrop-blur">
        <span className="text-[10px] uppercase tracking-wider text-gray-600">
          Risk
        </span>

        <LegendDot color="#22C55E" label="Low" />
        <LegendDot color="#EAB308" label="Medium" />
        <LegendDot color="#F59E0B" label="High" />
        <LegendDot color="#EF4444" label="Critical" />
      </div>

      {/* Resource Count */}
      <div className="absolute right-4 top-4 rounded-lg border border-white/10 bg-[#0B0914]/90 px-3 py-2 backdrop-blur">
        <p className="text-[10px] text-gray-600">
          Showing
        </p>

        <p className="text-xs font-semibold text-white">
          {displayedResources.length} / {resources.length} resources
        </p>
      </div>
    </div>
  );
}

function LegendDot({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />

      <span className="text-[10px] text-gray-500">
        {label}
      </span>
    </div>
  );
}

export default CloudMap;
