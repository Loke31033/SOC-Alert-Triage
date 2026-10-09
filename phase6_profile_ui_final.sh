#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/SOC-DATA-GENERATOR"
FRONTEND="$ROOT/web/frontend"
PAGE="$FRONTEND/app/student/profile/page.tsx"
CSS="$FRONTEND/app/student/profile/profile-ui.css"

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.phase6-profile-backup-$STAMP"

echo "============================================================"
echo " PHASE 6 — STUDENT PROFILE UI"
echo "============================================================"

cd "$ROOT"

mkdir -p "$BACKUP"

echo "[1/7] Backing up current Profile page..."

if [ -f "$PAGE" ]; then
    cp "$PAGE" "$BACKUP/page.tsx"
fi

if [ -f "$CSS" ]; then
    cp "$CSS" "$BACKUP/profile-ui.css"
fi

echo "[OK] Backup: $BACKUP"

echo "[2/7] Creating Profile UI stylesheet..."

mkdir -p "$(dirname "$CSS")"

cat > "$CSS" <<'CSS'
/* =========================================================
   SOC ALERT TRIAGE CONTEST
   STUDENT PROFILE — PHASE 6
   UI ONLY
   ========================================================= */

.profile-soc-page {
  min-height: 100vh;
  padding: 32px;
  color: #e5f3ff;

  background:
    radial-gradient(
      circle at 10% 0%,
      rgba(0, 212, 255, 0.13),
      transparent 28%
    ),
    radial-gradient(
      circle at 90% 15%,
      rgba(124, 58, 237, 0.13),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      #020617 0%,
      #071426 48%,
      #0f172a 100%
    );

  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

.profile-soc-container {
  width: min(1180px, 100%);
  margin: 0 auto;
}

.profile-soc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.profile-eyebrow {
  color: #22d3ee;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.profile-title {
  margin-top: 8px;
  font-size: clamp(30px, 5vw, 48px);
  line-height: 1.05;
  font-weight: 850;
  letter-spacing: -0.04em;
}

.profile-subtitle {
  margin-top: 12px;
  max-width: 720px;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.7;
}

.profile-live {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  border: 1px solid rgba(34, 211, 238, 0.25);
  background: rgba(8, 47, 73, 0.38);
  border-radius: 999px;
  padding: 9px 14px;
  color: #a5f3fc;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  white-space: nowrap;
}

.profile-live-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 14px rgba(34, 197, 94, 0.75);
}

.profile-identity-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(51, 65, 85, 0.9);
  border-radius: 20px;
  background:
    linear-gradient(
      135deg,
      rgba(15, 23, 42, 0.96),
      rgba(2, 6, 23, 0.92)
    );
  padding: 28px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.profile-identity-card::after {
  content: "";
  position: absolute;
  width: 280px;
  height: 280px;
  right: -120px;
  top: -150px;
  border-radius: 50%;
  background: rgba(6, 182, 212, 0.10);
  filter: blur(20px);
  pointer-events: none;
}

.profile-identity-layout {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 24px;
  align-items: center;
}

.profile-avatar {
  width: 94px;
  height: 94px;
  display: grid;
  place-items: center;
  border-radius: 22px;
  border: 1px solid rgba(34, 211, 238, 0.30);
  background:
    linear-gradient(
      145deg,
      rgba(8, 47, 73, 0.9),
      rgba(15, 23, 42, 0.9)
    );
  color: #67e8f9;
  font-size: 30px;
  font-weight: 900;
  box-shadow:
    0 0 30px rgba(34, 211, 238, 0.08);
}

.profile-identity-label {
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.profile-identity-name {
  margin-top: 6px;
  color: #f8fafc;
  font-size: 26px;
  font-weight: 850;
}

.profile-identity-team {
  margin-top: 6px;
  color: #22d3ee;
  font-size: 13px;
  font-weight: 700;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 18px;
}

.profile-info-card {
  border: 1px solid rgba(51, 65, 85, 0.85);
  border-radius: 16px;
  background: rgba(2, 6, 23, 0.72);
  padding: 22px;
}

.profile-info-label {
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.profile-info-value {
  margin-top: 10px;
  color: #f8fafc;
  font-size: 21px;
  font-weight: 800;
  word-break: break-word;
}

.profile-info-value.cyan {
  color: #67e8f9;
}

.profile-info-value.green {
  color: #86efac;
}

.profile-section {
  margin-top: 26px;
}

.profile-section-title {
  margin-bottom: 12px;
  color: #f8fafc;
  font-size: 17px;
  font-weight: 800;
}

.profile-section-subtitle {
  margin-top: -5px;
  margin-bottom: 15px;
  color: #64748b;
  font-size: 12px;
}

.profile-security-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.profile-security-card {
  border: 1px solid rgba(51, 65, 85, 0.80);
  border-radius: 15px;
  background: rgba(15, 23, 42, 0.62);
  padding: 19px;
}

.profile-security-icon {
  color: #22d3ee;
  font-size: 18px;
  font-weight: 900;
}

.profile-security-title {
  margin-top: 10px;
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 800;
}

.profile-security-text {
  margin-top: 6px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.profile-footer {
  margin-top: 28px;
  padding: 18px 20px;
  border: 1px solid rgba(51, 65, 85, 0.65);
  border-radius: 14px;
  background: rgba(2, 6, 23, 0.55);
  color: #64748b;
  font-size: 12px;
  line-height: 1.7;
}

.profile-loading,
.profile-error {
  min-height: 300px;
  display: grid;
  place-items: center;
  color: #94a3b8;
  text-align: center;
}

.profile-error {
  color: #fca5a5;
}

@media (max-width: 800px) {
  .profile-soc-page {
    padding: 20px;
  }

  .profile-soc-header {
    flex-direction: column;
  }

  .profile-identity-layout {
    grid-template-columns: 1fr;
  }

  .profile-avatar {
    width: 76px;
    height: 76px;
    border-radius: 18px;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .profile-security-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .profile-soc-page {
    padding: 14px;
  }

  .profile-identity-card {
    padding: 20px;
  }

  .profile-title {
    font-size: 30px;
  }

  .profile-identity-name {
    font-size: 22px;
  }
}
CSS

echo "[OK] Profile stylesheet created."

echo "[3/7] Installing Profile page..."

cat > "$PAGE" <<'TSX'
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
TSX

echo "[OK] Profile page installed."

echo "[4/7] Validating Profile markers..."

grep -q "Team Profile" "$PAGE"
grep -q "/api/student/me" "$PAGE"
grep -q "Participation Security" "$PAGE"
grep -q "profile-soc-page" "$PAGE"
grep -q "profile-ui.css" "$PAGE"

echo "[OK] Profile markers verified."

echo "[5/7] Running production build..."

cd "$FRONTEND"

if npm run build; then
    echo "[BUILD SUCCESS]"
else
    echo
    echo "[BUILD FAILED]"
    echo "[ROLLBACK] Restoring previous Profile page..."

    if [ -f "$BACKUP/page.tsx" ]; then
        cp "$BACKUP/page.tsx" "$PAGE"
    fi

    if [ -f "$BACKUP/profile-ui.css" ]; then
        cp "$BACKUP/profile-ui.css" "$CSS"
    else
        rm -f "$CSS"
    fi

    echo "[ROLLBACK COMPLETE]"
    exit 1
fi

echo "[6/7] Checking installed files..."

ls -lh "$PAGE"
ls -lh "$CSS"

echo "[7/7] Phase 6 completed successfully."

echo
echo "============================================================"
echo " PROFILE UI READY"
echo "============================================================"
echo
echo "URL:"
echo "  http://localhost:3000/student/profile"
echo
echo "Backup:"
echo "  $BACKUP"
echo
echo "Next:"
echo "  Restart dev server and hard refresh the browser."
echo
echo "============================================================"
