"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ReactNode,
  useEffect,
  useState,
} from "react";
import "../styles/student-soc.css";

type StudentShellProps = {
  children: ReactNode;
};

type StudentIdentity = {
  team_id?: string;
  team_name?: string;
  username?: string;
  contest_status?: string;
  success?: boolean;
};

const navItems = [
  ["/student/dashboard", "Dashboard"],
  ["/student/scenario01", "Scenario 01"],
  ["/student/scenario02", "Scenario 02"],
  ["/student/scenario03", "Scenario 03"],
  ["/student/scenario04", "Scenario 04"],
  ["/student/results", "Results"],
  ["/student/leaderboard", "Leaderboard"],
  ["/student/messages", "Messages"],
  ["/student/profile", "Team Profile"],
  ["/student/rules", "Rules / FAQ"],
] as const;

export default function StudentShell({
  children,
}: StudentShellProps) {

  /*
   * LIVE CONTEST STATE
   *
   * The admin panel controls contest_state and scenario_state
   * in PostgreSQL. Refresh every 3 seconds so students see
   * OPEN/CLOSED and scenario enable/disable changes without
   * manually refreshing the browser.
   */
  useEffect(() => {
    let stopped = false;

    const refreshContestState = async () => {
      try {
        const response = await fetch("/api/student/me", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) {
          return;
        }

        const nextIdentity: StudentIdentity =
          await response.json();

        if (!stopped && nextIdentity.success) {
          setIdentity(nextIdentity);
        }
      } catch (error) {
        console.error(
          "[STUDENT CONTEST STATE REFRESH]",
          error
        );
      }
    };

    const interval = window.setInterval(
      refreshContestState,
      3000
    );

    window.addEventListener(
      "focus",
      refreshContestState
    );

    return () => {
      stopped = true;
      window.clearInterval(interval);
      window.removeEventListener(
        "focus",
        refreshContestState
      );
    };
  }, []);

  const pathname = usePathname();

  const [identity, setIdentity] =
    useState<StudentIdentity | null>(null);

  const [loadingIdentity, setLoadingIdentity] =
    useState(true);

  useEffect(() => {
    let active = true;

    async function loadIdentity() {
      try {
        const response = await fetch(
          "/api/student/me",
          {
            cache: "no-store",
            credentials: "include",
          }
        );

        if (!response.ok) {
          return;
        }

        const json =
          (await response.json()) as StudentIdentity;

        if (active) {
          setIdentity(json);
        }
      } catch (error) {
        console.error(
          "[STUDENT SHELL] Identity load failed",
          error
        );
      } finally {
        if (active) {
          setLoadingIdentity(false);
        }
      }
    }

    loadIdentity();

    return () => {
      active = false;
    };
  }, []);

  async function logout() {
    try {
      await fetch(
        "/api/student/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error(
        "[STUDENT SHELL] Logout failed",
        error
      );
    } finally {
      sessionStorage.removeItem(
        "student_team_id"
      );

      sessionStorage.removeItem(
        "student_username"
      );

      window.location.href = "/student";
    }
  }

  const contestOpen =
    identity?.contest_status === "OPEN";

  return (
    <div className="student-soc-root">
      <div className="student-soc-layout">

        <aside className="student-soc-sidebar">

          <div className="student-soc-brand">
            <div className="student-soc-brand-title">
              SOC CONTEST
            </div>

            <div className="student-soc-brand-subtitle">
              STUDENT OPERATIONS CONSOLE
            </div>
          </div>

          <nav className="student-soc-nav">
            {navItems.map(
              ([href, label]) => {
                const active =
                  pathname === href ||
                  pathname.startsWith(
                    `${href}/`
                  );

                return (
                  <Link
                    key={href}
                    href={href}
                    data-active={active}
                  >
                    {label}
                  </Link>
                );
              }
            )}
          </nav>

          <div className="student-soc-logout">
            <button
              type="button"
              className="student-soc-button student-soc-button-danger"
              style={{ width: "100%" }}
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </aside>

        <section className="student-soc-main">

          <header className="student-soc-header">

            <div>
              <div className="student-soc-header-subtitle">
                Security Operations Center
              </div>

              <div className="student-soc-header-title">
                Student Investigation Console
              </div>
            </div>

            <div className="student-soc-header-right">

              {!loadingIdentity &&
                identity?.team_id && (
                  <span className="student-soc-team-badge">
                    TEAM {identity.team_id}
                  </span>
                )}

              {!loadingIdentity &&
                identity?.username && (
                  <span className="student-soc-team-badge">
                    {identity.username}
                  </span>
                )}

              <span
                className={
                  contestOpen
                    ? "student-soc-status student-soc-status-open"
                    : "student-soc-status student-soc-status-closed"
                }
              >
                ●{" "}
                {contestOpen
                  ? "CONTEST OPEN"
                  : "CONTEST STATUS"}
              </span>
            </div>

          </header>

          <main className="student-soc-content">
            {children}
          </main>

        </section>
      </div>
    </div>
  );
}
