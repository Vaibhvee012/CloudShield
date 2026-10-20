import React from "react";

/* ---------- tiny inline icons (no external deps) ---------- */
type IconProps = { size?: number; color?: string; stroke?: number; children: React.ReactNode };
const Icon = ({ size = 16, color = "currentColor", stroke = 1.8, children }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const Arrow = ({ size = 16 }: { size?: number }) => (
  <Icon size={size} stroke={2}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
);
const ShieldCheck = ({ size = 20, color = "#fff" }: { size?: number; color?: string }) => (
  <Icon size={size} color={color} stroke={1.8}>
    <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" />
  </Icon>
);
const CloudIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
    <path d="M7 18a4.5 4.5 0 01-.6-8.96A6 6 0 0117.7 8.4 4.8 4.8 0 0117 18H7z" />
  </svg>
);
const PlayIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round">
    <path d="M7 4l12 8-12 8V4z" />
  </svg>
);
const Dot = ({ size = 14 }: { size?: number }) => (
  <Icon size={size} stroke={1.6}><circle cx="12" cy="12" r="8" /></Icon>
);

/* ---------- data ---------- */
const sideItems = ["Dashboard", "AWS Resources", "Findings", "Security Score", "AI Assistant", "Remediation", "Audit Logs", "Settings"];

const findings = [
  { t: "Public S3 bucket detected", s: "S3 / us-east-1", sev: "Critical", c: "#ef4444", bg: "rgba(239,68,68,.14)" },
  { t: "EC2 instance without encryption", s: "EC2 / us-east-1", sev: "High", c: "#f97316", bg: "rgba(249,115,22,.14)" },
  { t: "Overly permissive IAM policy", s: "IAM / us-east-1", sev: "Medium", c: "#f59e0b", bg: "rgba(245,158,11,.14)" },
  { t: "Unencrypted RDS instance", s: "RDS / us-east-1", sev: "Medium", c: "#f59e0b", bg: "rgba(245,158,11,.14)" },
  { t: "Security group allows 0.0.0.0/0", s: "VPC / us-east-1", sev: "Low", c: "#22c55e", bg: "rgba(34,197,94,.14)" },
];

const nodes = [
  { n: "EC2", s: "12 instances", x: 62, y: 28, c: "#f97316", dot: "#34d399" },
  { n: "S3", s: "8 buckets", x: 338, y: 28, c: "#22c55e", dot: "#34d399" },
  { n: "RDS", s: "4 databases", x: 16, y: 94, c: "#6366f1", dot: "#a78bfa" },
  { n: "Lambda", s: "6 functions", x: 380, y: 94, c: "#f97316", dot: "#34d399" },
  { n: "VPC", s: "2 networks", x: 62, y: 160, c: "#8b5cf6", dot: "#34d399" },
  { n: "IAM", s: "3 roles", x: 338, y: 160, c: "#ef4444", dot: "#ef4444" },
];

const stats = [
  { label: "Total Resources", value: "128", delta: "6%", up: "#34d399", sub: "Across 6 services", ic: "#8b5cf6" },
  { label: "Open Findings", value: "12", delta: "3%", up: "#ef4444", sub: "Requires attention", ic: "#8b5cf6" },
  { label: "Critical Findings", value: "2", delta: "1", up: "#ef4444", sub: "Immediate action needed", ic: "#ef4444" },
];

/* ---------- component ---------- */
export default function Landing() {
  return (
    <div className="cs-root">
      <style>{css}</style>

      {/* background layers */}
      <div className="cs-bg">
        <div className="cloud c1" /><div className="cloud c2" /><div className="cloud c3" />
        <div className="cloud c4" /><div className="cloud c5" /><div className="cloud c6" />
        <div className="glow" />
        <div className="mtn m-left" /><div className="mtn m-right" />
        <div className="floor" />
        <span className="star" style={{ left: "19%", top: "24%" }} />
        <span className="star" style={{ left: "80.8%", top: "19.5%" }} />
        <span className="star" style={{ left: "19%", top: "43%" }} />
        <span className="star" style={{ left: "61%", top: "10%", opacity: 0.6 }} />
      </div>

      {/* nav */}
      <header className="nav">
        <div className="nav-in">
          <div className="nav-l">
            <div className="logo"><ShieldCheck size={22} /></div>
            <span className="brand">CloudShield</span>
            <nav className="links">
              <a href="#platform">Platform</a>
              <a href="#security">Security</a>
              <a href="#docs">Documentation</a>
            </nav>
          </div>
          <div className="nav-r">
            <button className="btn-outline sm">Sign in</button>
            <button className="btn-primary sm">Get started <Arrow /></button>
          </div>
        </div>
      </header>

      {/* hero */}
      <main className="hero">
        <div className="pill">CLOUD SECURITY POSTURE MANAGEMENT</div>
        <h1>
          Secure your cloud,<br />
          <em>confidently.</em>
        </h1>
        <p className="sub">
          Discover AWS misconfigurations, prioritize risk,<br />
          and get actionable security insights — all in one place.
        </p>
        <div className="cta">
          <button className="btn-primary lg"><CloudIcon /> Connect AWS <Arrow /></button>
          <button className="btn-outline lg"><PlayIcon /> Explore platform</button>
        </div>

        {/* dashboard mock */}
        <div className="dash-wrap">
          <div className="dash">
            {/* sidebar */}
            <aside className="side">
              <div className="side-brand">
                <div className="logo xs"><ShieldCheck size={13} /></div>
                <span>CloudShield</span>
              </div>
              {sideItems.map((s, i) => (
                <div key={s} className={"side-item" + (i === 0 ? " active" : "")}>
                  <Dot size={11} /> {s}
                </div>
              ))}
            </aside>

            {/* main */}
            <section className="dmain">
              <div className="topbar">
                <div className="search">
                  <Icon size={10}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></Icon>
                  Search resources, findings, or anything...
                </div>
                <div className="user"><span className="av">V</span> Vaibhvee
                  <Icon size={9}><path d="M6 9l6 6 6-6" /></Icon>
                </div>
              </div>

              <div className="cards">
                {/* score */}
                <div className="card score">
                  <div className="c-title">Security Posture Score</div>
                  <div className="score-row">
                    <div className="ring">
                      <svg viewBox="0 0 64 64" width="62" height="62">
                        <defs>
                          <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#38bdf8" />
                          </linearGradient>
                        </defs>
                        <circle cx="32" cy="32" r="27" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="5" />
                        <circle cx="32" cy="32" r="27" fill="none" stroke="url(#rg)" strokeWidth="5" strokeLinecap="round"
                          strokeDasharray={`${0.78 * 169.6} 169.6`} transform="rotate(-90 32 32)" />
                      </svg>
                      <div className="ring-t"><b>78</b><small>/100</small></div>
                    </div>
                    <div className="score-txt">
                      <span className="grow">↑ 12%</span>
                      <b>Good</b>
                      <small>Your cloud is<br />mostly secure</small>
                    </div>
                  </div>
                </div>

                {stats.map((s) => (
                  <div className="card" key={s.label}>
                    <div className="c-title">{s.label}</div>
                    <div className="stat-row">
                      <span className="stat-ic" style={{ background: s.ic === "#ef4444" ? "rgba(239,68,68,.18)" : "rgba(139,92,246,.18)" }}>
                        <Icon size={13} color={s.ic}><rect x="5" y="5" width="14" height="14" rx="3" /><path d="M9 10h6M9 14h6" /></Icon>
                      </span>
                      <b>{s.value}</b>
                      <span className="delta" style={{ color: s.up }}>↑ {s.delta}</span>
                    </div>
                    <div className="c-sub">{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="lower">
                {/* map */}
                <div className="card map">
                  <div className="map-h">
                    <span className="c-title">Cloud Infrastructure Map</span>
                    <span className="live">Live <i /> AWS</span>
                  </div>
                  <div className="map-body">
                    <svg className="lines" viewBox="0 0 470 210" preserveAspectRatio="none">
                      {[[148, 56], [338, 56], [100, 122], [380, 122], [148, 188], [338, 188]].map(([x, y], i) => (
                        <line key={i} x1={x} y1={y} x2={235} y2={110} stroke="rgba(139,92,246,.35)" strokeWidth="1" strokeDasharray="2 4" />
                      ))}
                    </svg>
                    <div className="aws">
                      <svg width="120" height="92" viewBox="0 0 120 92">
                        <defs>
                          <filter id="gl"><feGaussianBlur stdDeviation="3" /></filter>
                        </defs>
                        <path d="M30 76a20 20 0 01-3-39.7A28 28 0 0182 26a22 22 0 018 43c-1 4-4 7-9 7H30z"
                          fill="rgba(139,92,246,.35)" stroke="#a78bfa" strokeWidth="1.6" filter="url(#gl)" />
                        <path d="M30 76a20 20 0 01-3-39.7A28 28 0 0182 26a22 22 0 018 43c-1 4-4 7-9 7H30z"
                          fill="#1a1236" stroke="#a78bfa" strokeWidth="1.4" />
                        <text x="60" y="52" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="700">aws</text>
                        <path d="M44 60q16 8 32 0" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                      </svg>
                    </div>
                    {nodes.map((n) => (
                      <div className="node" key={n.n} style={{ left: n.x, top: n.y }}>
                        <span className="n-ic" style={{ background: n.c + "33", color: n.c }}>
                          <Icon size={13}><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9 9h6v6H9z" /></Icon>
                        </span>
                        <div><b>{n.n}</b><small>{n.s}</small></div>
                        <i className="n-dot" style={{ background: n.dot, [n.x < 235 ? "right" : "left"]: -4 } as React.CSSProperties} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* recent findings */}
                <div className="card rec">
                  <div className="map-h">
                    <span className="c-title">Recent Findings</span>
                    <span className="viewall">View all →</span>
                  </div>
                  <div className="rec-list">
                    <div className="rail" />
                    {findings.map((f) => (
                      <div className="f-row" key={f.t}>
                        <i className="f-dot" style={{ background: f.c }} />
                        <div className="f-txt"><b>{f.t}</b><small>{f.s}</small></div>
                        <span className="badge" style={{ color: f.c, background: f.bg }}>{f.sev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- styles ---------- */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@1&display=swap');
.cs-root{position:relative;min-height:940px;overflow:hidden;color:#fff;font-family:'Inter',system-ui,sans-serif;
  background:linear-gradient(180deg,#0a0716 0%,#150b33 45%,#1c0f45 75%,#0c0720 100%);-webkit-font-smoothing:antialiased}
.cs-root *{box-sizing:border-box;margin:0;padding:0}
.cs-root a{color:inherit;text-decoration:none}
.cs-root button{font-family:inherit;cursor:pointer}

/* background */
.cs-bg{position:absolute;inset:0;pointer-events:none;z-index:0}
.cloud{position:absolute;border-radius:50%;filter:blur(38px)}
.c1{left:-8%;top:12%;width:34%;height:46%;background:radial-gradient(circle,#5b2db3 0%,#3a1c7a 55%,transparent 75%);opacity:.95}
.c2{left:2%;top:36%;width:26%;height:30%;background:radial-gradient(circle,#7c3aed 0%,#4c1d95 55%,transparent 75%);opacity:.85}
.c3{left:-4%;top:58%;width:30%;height:22%;background:radial-gradient(circle,#6d28d9 0%,transparent 70%);opacity:.7}
.c4{right:-8%;top:10%;width:34%;height:46%;background:radial-gradient(circle,#5b2db3 0%,#3a1c7a 55%,transparent 75%);opacity:.95}
.c5{right:2%;top:34%;width:26%;height:30%;background:radial-gradient(circle,#7c3aed 0%,#4c1d95 55%,transparent 75%);opacity:.85}
.c6{right:-4%;top:58%;width:30%;height:22%;background:radial-gradient(circle,#6d28d9 0%,transparent 70%);opacity:.7}
.glow{position:absolute;left:50%;top:38%;width:70%;height:40%;transform:translateX(-50%);
  background:radial-gradient(ellipse,rgba(139,92,246,.35),transparent 70%);filter:blur(30px)}
.mtn{position:absolute;bottom:0;height:34%;background:linear-gradient(180deg,#3b1f80,#170d3a)}
.m-left{left:0;width:30%;clip-path:polygon(0 38%,18% 55%,32% 30%,52% 60%,75% 48%,100% 80%,100% 100%,0 100%);opacity:.85}
.m-right{right:0;width:30%;clip-path:polygon(0 80%,25% 48%,48% 60%,68% 28%,82% 52%,100% 36%,100% 100%,0 100%);opacity:.85}
.floor{position:absolute;left:0;right:0;bottom:0;height:12%;background:linear-gradient(180deg,transparent,#2a1568 60%,#4c2aa0);opacity:.7}
.star{position:absolute;width:3px;height:3px;border-radius:50%;background:#c4b5fd;box-shadow:0 0 8px 2px #a78bfa}

/* nav */
.nav{position:relative;z-index:5;height:71px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(8,5,20,.55);backdrop-filter:blur(10px)}
.nav-in{max-width:1360px;margin:0 auto;height:100%;display:flex;align-items:center;justify-content:space-between;padding:0 16px}
.nav-l,.nav-r{display:flex;align-items:center}
.nav-r{gap:14px}
.logo{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;
  background:linear-gradient(135deg,#8b5cf6,#6d3ff0);box-shadow:0 0 22px rgba(139,92,246,.55)}
.logo.xs{width:22px;height:22px;border-radius:6px;box-shadow:none}
.brand{margin-left:14px;font-size:21px;font-weight:600;letter-spacing:-.2px}
.links{display:flex;gap:48px;margin-left:82px}
.links a{font-size:15px;color:#e2dcf5;font-weight:500}
.btn-primary{display:inline-flex;align-items:center;gap:9px;border:0;color:#fff;font-weight:500;
  background:linear-gradient(180deg,#8b5cf6,#6d45f2);box-shadow:0 6px 24px rgba(124,77,255,.45),inset 0 1px 0 rgba(255,255,255,.25)}
.btn-outline{display:inline-flex;align-items:center;gap:9px;color:#fff;font-weight:500;background:rgba(15,10,35,.35);
  border:1px solid rgba(255,255,255,.28)}
.sm{height:42px;padding:0 24px;border-radius:12px;font-size:15px}
.btn-outline.sm{border-radius:14px;padding:0 24px}
.btn-primary.sm{padding:0 24px;border-radius:14px}
.lg{height:44px;padding:0 28px;border-radius:14px;font-size:16px}
.btn-primary.lg{padding:0 28px 0 28px}

/* hero */
.hero{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:40px}
.pill{padding:0 20px;height:33px;display:flex;align-items:center;border-radius:12px;font-size:12.5px;letter-spacing:2.6px;font-weight:500;color:#cfc6f5;
  background:rgba(25,17,58,.75);border:1px solid rgba(139,92,246,.4)}
.hero h1{margin-top:20px;font-size:58px;line-height:1.07;font-weight:600;letter-spacing:-1.2px}
.hero h1 em{font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-weight:400;font-size:76px;letter-spacing:-.5px;
  background:linear-gradient(90deg,#c4a8ff,#8b5cf6 50%,#b794ff);-webkit-background-clip:text;background-clip:text;color:transparent;display:inline-block;margin-top:-4px}
.sub{margin-top:18px;font-size:17.5px;line-height:1.5;color:#d4cdee}
.cta{margin-top:28px;display:flex;gap:16px}

/* dashboard */
.dash-wrap{margin-top:42px;width:944px;max-width:94vw;padding:0}
.dash{position:relative;display:flex;border-radius:22px 22px 0 0;border:1.5px solid rgba(139,92,246,.7);border-bottom:0;
  background:linear-gradient(180deg,#0e0a20,#0a0717);box-shadow:0 0 60px rgba(139,92,246,.45),0 -10px 50px rgba(139,92,246,.25);
  height:425px;overflow:hidden;text-align:left;padding:12px 10px 0 0}
.side{width:148px;padding:6px 6px 0 14px;border-right:1px solid rgba(255,255,255,.05);background:rgba(255,255,255,.01);flex-shrink:0}
.side-brand{display:flex;align-items:center;gap:7px;font-size:11.5px;font-weight:600;margin:4px 0 22px 4px}
.side-item{display:flex;align-items:center;gap:8px;height:25px;margin-bottom:0;padding:0 10px;border-radius:6px;font-size:9.5px;color:#b9b2d6;margin-bottom:0}
.side-item+.side-item{margin-top:0}
.side-item.active{background:rgba(139,92,246,.25);color:#fff;border:1px solid rgba(139,92,246,.45)}
.side-item{margin-bottom:0}
.side-item:not(.active){height:24.8px}
.dmain{flex:1;padding-left:12px;min-width:0}
.topbar{display:flex;justify-content:space-between;align-items:center;height:30px;margin-bottom:12px}
.search{width:405px;height:26px;border-radius:7px;background:rgba(255,255,255,.04);display:flex;align-items:center;gap:7px;padding:0 10px;font-size:8px;color:#6f6990}
.user{display:flex;align-items:center;gap:6px;font-size:8px;color:#e8e3fa;margin-right:6px}
.av{width:16px;height:16px;border-radius:50%;background:#7c4dff;display:grid;place-items:center;font-size:8px;font-weight:600}
.cards{display:grid;grid-template-columns:1.02fr 1fr 1fr 1fr;gap:12px}
.card{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:12px 14px}
.c-title{font-size:9.5px;font-weight:500;color:#f0ecff}
.c-sub{font-size:8px;color:#8d86ad;margin-top:14px}
.cards .card{height:104px}
.score-row{display:flex;align-items:center;gap:10px;margin-top:10px}
.ring{position:relative;width:62px;height:62px;flex-shrink:0;filter:drop-shadow(0 0 6px rgba(139,92,246,.5))}
.ring-t{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}
.ring-t b{font-size:17px;font-weight:600}.ring-t small{font-size:6.5px;color:#9a93ba;margin-top:2px}
.score-txt{display:flex;flex-direction:column;gap:2px}
.score-txt .grow{font-size:7.5px;color:#34d399}
.score-txt b{font-size:9.5px;font-weight:600}
.score-txt small{font-size:7.5px;line-height:1.4;color:#8d86ad}
.stat-row{display:flex;align-items:center;gap:9px;margin-top:12px}
.stat-row b{font-size:19px;font-weight:500}
.stat-ic{width:24px;height:24px;border-radius:50%;display:grid;place-items:center}
.delta{margin-left:auto;font-size:7.5px}
.lower{display:grid;grid-template-columns:1.45fr 1fr;gap:12px;margin-top:12px}
.lower .card{height:240px;padding:12px 14px}
.map-h{display:flex;justify-content:space-between;align-items:center}
.live{font-size:7.5px;color:#9a93ba;display:flex;align-items:center;gap:4px}
.live i{width:4px;height:4px;border-radius:50%;background:#34d399;display:inline-block}
.viewall{font-size:7.5px;color:#a78bfa}
.map-body{position:relative;height:200px;margin-top:6px}
.lines{position:absolute;inset:0;width:100%;height:100%}
.aws{position:absolute;left:50%;top:50%;transform:translate(-50%,-48%);filter:drop-shadow(0 0 14px rgba(139,92,246,.8))}
.node{position:absolute;display:flex;align-items:center;gap:7px;height:42px;padding:0 12px 0 8px;border-radius:8px;
  background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);min-width:96px}
.node b{display:block;font-size:8.5px;font-weight:500}
.node small{display:block;font-size:6.5px;color:#8d86ad;margin-top:2px}
.n-ic{width:20px;height:20px;border-radius:5px;display:grid;place-items:center}
.n-dot{position:absolute;top:50%;width:5px;height:5px;margin-top:-2.5px;border-radius:50%;box-shadow:0 0 6px currentColor}
.rec-list{position:relative;margin-top:12px}
.rail{position:absolute;left:3px;top:8px;bottom:8px;width:1px;background:rgba(255,255,255,.1)}
.f-row{position:relative;display:flex;align-items:center;gap:10px;height:41.5px;border-bottom:1px solid rgba(255,255,255,.05)}
.f-row:last-child{border-bottom:0}
.f-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;box-shadow:0 0 6px currentColor;z-index:1}
.f-txt{flex:1;min-width:0}
.f-txt b{display:block;font-size:8px;font-weight:500;color:#f0ecff;white-space:nowrap}
.f-txt small{display:block;font-size:6.5px;color:#8d86ad;margin-top:3px}
.badge{font-size:7px;font-weight:500;padding:3px 8px;border-radius:5px;flex-shrink:0}

@media (max-width:860px){
  .links{display:none}
  .hero h1{font-size:40px}.hero h1 em{font-size:54px}
  .cta{flex-direction:column}
  .dash{height:auto;overflow-x:auto}
  .side{display:none}
}
`;