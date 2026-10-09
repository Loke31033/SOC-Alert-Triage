"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const nav = [
  ["dashboard", "Dashboard", "/admin/dashboard"],
  ["teams", "Teams", "/admin/teams"],
  ["submissions", "Submissions", "/admin/submissions"],
  ["results", "Results", "/admin/results"],
  ["leaderboard", "Leaderboard", "/admin/leaderboard"],
  ["contest", "Contest Control", "/admin/contest"],
  ["settings", "Settings", "/admin/settings"],
  ["audit", "Integrity Audit", "/admin/audit"],
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [contest, setContest] = useState("CHECKING");
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    fetch("/api/admin/contest", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setContest(String(d?.contest?.status || d?.contest?.state || "UNKNOWN")))
      .catch(() => setContest("OFFLINE"));
  }, [isLogin]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    router.push("/admin/login");
    router.refresh();
  }

  if (isLogin) return <>{children}</>;

  return (
    <div className="admin-app">
      <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
        <div className="admin-brand">
          <div className="admin-brand-mark">SOC</div>
          <div>
            <strong>CONTEST OPS</strong>
            <span>Security Operations Center</span>
          </div>
        </div>

        <div className="admin-status">
          <span className={`admin-status-dot ${contest === "OPEN" || contest === "RUNNING" ? "live" : ""}`} />
          <div>
            <small>CONTEST STATUS</small>
            <b>{contest}</b>
          </div>
        </div>

        <nav className="admin-nav">
          <p>OPERATIONS</p>
          {nav.map(([key, label, href]) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <a key={key} href={href} onClick={() => setOpen(false)} className={active ? "active" : ""}>
                <span className={`admin-nav-icon icon-${key}`}>{key === "dashboard" ? "▦" : key === "teams" ? "◉" : key === "submissions" ? "▤" : key === "results" ? "✓" : key === "leaderboard" ? "↗" : key === "contest" ? "●" : key === "settings" ? "⚙" : "◌"}</span>
                <span>{label}</span>
              </a>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <a href="/" className="admin-secondary-link">← Public portal</a>
          <button onClick={logout}>Sign out</button>
        </div>
      </aside>

      {open && <button aria-label="Close menu" className="admin-overlay" onClick={() => setOpen(false)} />}

      <section className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-button" onClick={() => setOpen(true)} aria-label="Open navigation">☰</button>
          <div>
            <span className="admin-kicker">ADMINISTRATOR / CONTROL PLANE</span>
            <strong>{pathname.replace("/admin/", "").replaceAll("/", " / ") || "dashboard"}</strong>
          </div>
          <div className="admin-topbar-right">
            <span className={`live-pill ${contest === "OPEN" || contest === "RUNNING" ? "live" : ""}`}>
              <i /> {contest}
            </span>
            <span className="admin-user">ADMIN</span>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </section>
    </div>
  );
}
