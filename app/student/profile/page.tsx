"use client";

import { useEffect, useMemo, useState } from "react";
import "./profile-ui.css";

type StudentIdentity = {
  team_id?: string;
  team_name?: string;
  username?: string;
  contest_status?: string;
  success?: boolean;
};

export default function StudentProfilePage() {
  const [identity, setIdentity] =
    useState<StudentIdentity | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadIdentity() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/student/me", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message || "Unable to load student identity."
          );
        }

        if (active) {
          setIdentity(data);
        }
      } catch (err) {
        /*
         * Keep compatibility with the existing student session
         * while the authenticated identity endpoint is unavailable.
         */
        const fallbackTeamId =
          typeof window !== "undefined"
            ? sessionStorage.getItem("student_team_id") || ""
            : "";

        const fallbackTeamName =
          typeof window !== "undefined"
            ? sessionStorage.getItem("student_team_name") || ""
            : "";

        if (fallbackTeamId || fallbackTeamName) {
          if (active) {
            setIdentity({
              team_id: fallbackTeamId,
              team_name: fallbackTeamName,
            });
          }
        } else if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load student identity."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadIdentity();

    return () => {
      active = false;
    };
  }, []);

  const initials = useMemo(() => {
    const value =
      identity?.team_name ||
      identity?.team_id ||
      identity?.username ||
      "ST";

    const parts = value
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return value.slice(0, 2).toUpperCase();
  }, [identity]);

  const contestStatus =
    identity?.contest_status || "ACTIVE";

  if (loading) {
    return (
      <main className="profile-soc-page">
        <div className="profile-soc-container profile-loading">
          Loading secure student identity...
        </div>
      </main>
    );
  }

  if (error && !identity) {
    return (
      <main className="profile-soc-page">
        <div className="profile-soc-container profile-error">
          <div>
            <strong>Identity unavailable</strong>
            <div style={{ marginTop: 8 }}>{error}</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-soc-page">
      <div className="profile-soc-container">

        <header className="profile-soc-header">
          <div>
            <div className="profile-eyebrow">
              SOC ALERT TRIAGE CONTEST
            </div>

            <h1 className="profile-title">
              Team Profile
            </h1>

            <p className="profile-subtitle">
              Secure contest identity and participation
              information for the currently authenticated
              student account.
            </p>
          </div>

          <div className="profile-live">
            <span className="profile-live-dot" />
            {String(contestStatus).toUpperCase()}
          </div>
        </header>

        <section className="profile-identity-card">
          <div className="profile-identity-layout">

            <div className="profile-avatar">
              {initials}
            </div>

            <div>
              <div className="profile-identity-label">
                Authenticated Team
              </div>

              <div className="profile-identity-name">
                {identity?.team_name ||
                  identity?.team_id ||
                  "Assigned Team"}
              </div>

              <div className="profile-identity-team">
                {identity?.team_id || "TEAM ID UNAVAILABLE"}
              </div>
            </div>

          </div>
        </section>

        <section className="profile-grid">

          <div className="profile-info-card">
            <div className="profile-info-label">
              Student Username
            </div>

            <div className="profile-info-value">
              {identity?.username || "Unavailable"}
            </div>
          </div>

          <div className="profile-info-card">
            <div className="profile-info-label">
              Team ID
            </div>

            <div className="profile-info-value cyan">
              {identity?.team_id || "Unavailable"}
            </div>
          </div>

          <div className="profile-info-card">
            <div className="profile-info-label">
              Team Name
            </div>

            <div className="profile-info-value">
              {identity?.team_name || "Unavailable"}
            </div>
          </div>

          <div className="profile-info-card">
            <div className="profile-info-label">
              Contest Access
            </div>

            <div className="profile-info-value green">
              {contestStatus}
            </div>
          </div>

        </section>

        <section className="profile-section">
          <div className="profile-section-title">
            Participation Security
          </div>

          <div className="profile-section-subtitle">
            Identity and access controls applicable to your
            contest session.
          </div>

          <div className="profile-security-grid">

            <div className="profile-security-card">
              <div className="profile-security-icon">
                ID
              </div>

              <div className="profile-security-title">
                Assigned Identity
              </div>

              <div className="profile-security-text">
                Your team identity is assigned by the contest
                registration system.
              </div>
            </div>

            <div className="profile-security-card">
              <div className="profile-security-icon">
                SOC
              </div>

              <div className="profile-security-title">
                Controlled Access
              </div>

              <div className="profile-security-text">
                Scenario access is controlled by the contest
                backend and current contest state.
              </div>
            </div>

            <div className="profile-security-card">
              <div className="profile-security-icon">
                SEC
              </div>

              <div className="profile-security-title">
                Credential Protection
              </div>

              <div className="profile-security-text">
                Do not share your student credentials or use
                another team's account.
              </div>
            </div>

          </div>
        </section>

        <div className="profile-footer">
          <strong style={{ color: "#94a3b8" }}>
            Contest Identity Notice
          </strong>
          <br />
          Team assignment, scenario authorization and contest
          access remain authoritative at the backend. This
          profile page is informational and does not modify
          your contest identity.
        </div>

      </div>
    </main>
  );
}
