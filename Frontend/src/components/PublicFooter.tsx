import { Link } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/platform", label: "Platform" },
  { to: "/security", label: "Security" },
  { to: "/docs", label: "Documentation" },
];

export default function PublicFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-5 py-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-[13px] text-white/45">
        <span>CloudShield</span>
        <nav aria-label="Footer" className="flex flex-wrap gap-6">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}