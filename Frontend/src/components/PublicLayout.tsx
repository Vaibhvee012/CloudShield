import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import PublicNav from "./PublicNav";

type PublicLayoutProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children?: ReactNode;
};

export function PublicCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="pl-card">
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

export default function PublicLayout({
  eyebrow,
  title,
  intro,
  children,
}: PublicLayoutProps) {
  return (
    <div className="pl-root">
      <style>{css}</style>

      <PublicNav />

      <main className="pl-main">
        <div className="pl-eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p className="pl-intro">{intro}</p>
        <div className="pl-body">{children}</div>
      </main>

      <footer className="pl-foot">
        <span>CloudShield</span>
        <Link to="/">Home</Link>
        <Link to="/platform">Platform</Link>
        <Link to="/security">Security</Link>
        <Link to="/docs">Documentation</Link>
      </footer>
    </div>
  );
}

const css = `
.pl-root{min-height:100vh;display:flex;flex-direction:column;color:#fff;
  font-family:'Inter',system-ui,sans-serif;
  background:linear-gradient(180deg,#0a0716 0%,#150b33 45%,#1c0f45 75%,#0c0720 100%)}
.pl-root *{box-sizing:border-box}
.pl-main{flex:1;width:100%;max-width:960px;margin:0 auto;padding:64px 20px 80px}
.pl-eyebrow{display:inline-flex;align-items:center;height:30px;padding:0 16px;border-radius:12px;
  font-size:12px;letter-spacing:2.4px;font-weight:500;color:#cfc6f5;
  background:rgba(25,17,58,.75);border:1px solid rgba(139,92,246,.4)}
.pl-main h1{margin-top:18px;font-size:44px;line-height:1.1;font-weight:600;letter-spacing:-.8px}
.pl-intro{margin-top:16px;max-width:680px;font-size:17px;line-height:1.6;color:#d4cdee}
.pl-body{margin-top:40px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
.pl-card{background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);
  border-radius:14px;padding:20px}
.pl-card h3{font-size:16px;font-weight:600;margin-bottom:8px}
.pl-card p{font-size:14px;line-height:1.6;color:#b9b2d6}
.pl-note{grid-column:1/-1;font-size:13px;line-height:1.6;color:#8d86ad;padding-top:8px}
.pl-note a{color:#a78bfa;text-decoration:none}
.pl-note a:hover{text-decoration:underline}
.pl-foot{display:flex;flex-wrap:wrap;gap:24px;justify-content:center;padding:24px 16px;
  border-top:1px solid rgba(255,255,255,.06);font-size:13px;color:#8d86ad}
.pl-foot a{color:#b9b2d6;text-decoration:none}
.pl-foot a:hover{color:#fff}
@media (max-width:860px){
  .pl-main{padding:40px 16px 56px}
  .pl-main h1{font-size:32px}
}
`;