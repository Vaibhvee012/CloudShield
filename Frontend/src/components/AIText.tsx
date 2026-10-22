/*
 * Renders AI text safely: only React elements, never raw HTML.
 * Supports **bold** and "* " or "- " bullets, and strips # headings.
 */
export default function AIText({
  text,
  className = "space-y-2 text-sm leading-6 text-gray-300",
}: {
  text: string;
  className?: string;
}) {
  const lines = text
    .replace(/`/g, "")
    .split("\n")
    .map((line) => line.replace(/^#+\s*/, "").trim())
    .filter(Boolean);

  return (
    <div className={className}>
      {lines.map((line, index) => {
        const isBullet = /^[*-]\s+/.test(line);
        const content = line.replace(/^[*-]\s+/, "");

        const parts = content
          .split(/(\*\*[^*]+\*\*)/g)
          .filter(Boolean)
          .map((part, partIndex) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={partIndex} className="font-semibold text-white">
                {part.slice(2, -2)}
              </strong>
            ) : (
              <span key={partIndex}>{part}</span>
            )
          );

        return isBullet ? (
          <p key={index} className="flex gap-2">
            <span className="text-[#A78BFA]">•</span>
            <span>{parts}</span>
          </p>
        ) : (
          <p key={index}>{parts}</p>
        );
      })}
    </div>
  );
}