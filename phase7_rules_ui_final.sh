#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/SOC-DATA-GENERATOR"
FRONTEND="$ROOT/web/frontend"

PAGE="$FRONTEND/app/student/rules/page.tsx"
CSS="$FRONTEND/app/student/rules/rules-ui.css"

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.phase7-rules-backup-$STAMP"

echo "============================================================"
echo " PHASE 7 — STUDENT RULES / FAQ UI"
echo "============================================================"

cd "$ROOT"

mkdir -p "$BACKUP"

echo "[1/7] Backing up existing Rules page..."

if [ -f "$PAGE" ]; then
    cp "$PAGE" "$BACKUP/page.tsx"
fi

if [ -f "$CSS" ]; then
    cp "$CSS" "$BACKUP/rules-ui.css"
fi

echo "[OK] Backup: $BACKUP"

echo "[2/7] Creating Rules stylesheet..."

mkdir -p "$(dirname "$CSS")"

cat > "$CSS" <<'CSS'
/* =========================================================
   SOC ALERT TRIAGE CONTEST
   STUDENT RULES / FAQ — PHASE 7
   UI ONLY
   ========================================================= */

.rules-soc-page {
  min-height: 100vh;
  padding: 32px;
  color: #e5f3ff;

  background:
    radial-gradient(
      circle at 8% 0%,
      rgba(0, 212, 255, 0.13),
      transparent 28%
    ),
    radial-gradient(
      circle at 92% 12%,
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

.rules-soc-container {
  width: min(1120px, 100%);
  margin: 0 auto;
}

.rules-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 30px;
}

.rules-eyebrow {
  color: #22d3ee;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.rules-title {
  margin-top: 8px;
  font-size: clamp(30px, 5vw, 48px);
  line-height: 1.05;
  font-weight: 850;
  letter-spacing: -0.04em;
}

.rules-subtitle {
  margin-top: 12px;
  max-width: 760px;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.7;
}

.rules-status {
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

.rules-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 14px rgba(34, 197, 94, 0.75);
}

.rules-section {
  margin-top: 28px;
}

.rules-section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.rules-section-title {
  color: #f8fafc;
  font-size: 20px;
  font-weight: 850;
}

.rules-section-caption {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.rules-grid {
  display: grid;
  gap: 13px;
}

.rule-card {
  display: grid;
  grid-template-columns: 58px 1fr;
  gap: 18px;
  border: 1px solid rgba(51, 65, 85, 0.85);
  border-radius: 16px;
  background: rgba(2, 6, 23, 0.72);
  padding: 20px;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
}

.rule-card:hover {
  transform: translateY(-2px);
  border-color: rgba(34, 211, 238, 0.32);
  background: rgba(8, 20, 38, 0.88);
}

.rule-number {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  border: 1px solid rgba(34, 211, 238, 0.24);
  background: rgba(8, 47, 73, 0.45);
  color: #67e8f9;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.rule-title {
  color: #f8fafc;
  font-size: 15px;
  font-weight: 800;
}

.rule-text {
  margin-top: 6px;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.7;
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.faq-card {
  border: 1px solid rgba(51, 65, 85, 0.82);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.62);
  padding: 20px;
}

.faq-question {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.5;
}

.faq-icon {
  flex: 0 0 auto;
  width: 25px;
  height: 25px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: rgba(34, 211, 238, 0.10);
  color: #22d3ee;
  font-size: 12px;
  font-weight: 900;
}

.faq-answer {
  margin-top: 11px;
  padding-left: 36px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.7;
}

.rules-notice {
  margin-top: 28px;
  border: 1px solid rgba(245, 158, 11, 0.22);
  border-radius: 16px;
  background: rgba(120, 53, 15, 0.12);
  padding: 20px;
}

.rules-notice-title {
  color: #fbbf24;
  font-size: 13px;
  font-weight: 850;
}

.rules-notice-text {
  margin-top: 7px;
  color: #a8a29e;
  font-size: 12px;
  line-height: 1.7;
}

.rules-footer {
  margin-top: 24px;
  padding: 17px 20px;
  border: 1px solid rgba(51, 65, 85, 0.65);
  border-radius: 14px;
  background: rgba(2, 6, 23, 0.55);
  color: #64748b;
  font-size: 11px;
  line-height: 1.7;
}

@media (max-width: 800px) {
  .rules-soc-page {
    padding: 20px;
  }

  .rules-header {
    flex-direction: column;
  }

  .faq-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .rules-soc-page {
    padding: 14px;
  }

  .rules-title {
    font-size: 30px;
  }

  .rule-card {
    grid-template-columns: 1fr;
  }

  .rules-section-heading {
    display: block;
  }

  .rules-section-caption {
    margin-top: 5px;
  }
}
CSS

echo "[OK] Rules stylesheet created."

echo "[3/7] Installing Rules / FAQ page..."

cat > "$PAGE" <<'TSX'
"use client";

import "./rules-ui.css";

const rules = [
  {
    title: "Use only your assigned credentials",
    text:
      "Do not use another team's account or attempt to access another team's investigation data.",
  },
  {
    title: "Investigate before answering",
    text:
      "Use the provided SOC investigation environment and available evidence before submitting answers.",
  },
  {
    title: "Submit carefully",
    text:
      "Review your answers before submission. Existing submission rules enforced by the backend remain authoritative.",
  },
  {
    title: "Do not attack the contest infrastructure",
    text:
      "Only investigate the datasets and systems explicitly provided for the contest.",
  },
  {
    title: "Report technical problems",
    text:
      "Use the support interface when a legitimate technical issue prevents investigation or submission.",
  },
];

const faq = [
  {
    q: "Can I change an answer after submission?",
    a:
      "This depends on the existing submission rules enforced by the contest backend.",
  },
  {
    q: "Why can't I open a scenario?",
    a:
      "The contest state, scenario state and student access controls may prevent access.",
  },
  {
    q: "Where do I investigate the logs?",
    a:
      "Use the Kibana investigation interface provided for the assigned scenario.",
  },
  {
    q: "Where can I see my score?",
    a:
      "Use the Results section after a submission has been evaluated.",
  },
];

export default function StudentRulesPage() {
  return (
    <main className="rules-soc-page">
      <div className="rules-soc-container">

        <header className="rules-header">

          <div>
            <div className="rules-eyebrow">
              SOC ALERT TRIAGE CONTEST
            </div>

            <h1 className="rules-title">
              Rules & FAQ
            </h1>

            <p className="rules-subtitle">
              Contest operating rules, investigation guidance and
              frequently asked questions for student teams.
            </p>
          </div>

          <div className="rules-status">
            <span className="rules-status-dot" />
            CONTEST CONTROL
          </div>

        </header>

        <section className="rules-section">

          <div className="rules-section-heading">
            <div className="rules-section-title">
              Contest Rules
            </div>

            <div className="rules-section-caption">
              Mandatory
            </div>
          </div>

          <div className="rules-grid">

            {rules.map((rule, index) => (
              <article
                key={rule.title}
                className="rule-card"
              >
                <div className="rule-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div>
                  <div className="rule-title">
                    {rule.title}
                  </div>

                  <div className="rule-text">
                    {rule.text}
                  </div>
                </div>
              </article>
            ))}

          </div>

        </section>

        <section className="rules-section">

          <div className="rules-section-heading">
            <div className="rules-section-title">
              Frequently Asked Questions
            </div>

            <div className="rules-section-caption">
              Quick Reference
            </div>
          </div>

          <div className="faq-grid">

            {faq.map((item) => (
              <article
                key={item.q}
                className="faq-card"
              >
                <div className="faq-question">
                  <span className="faq-icon">
                    ?
                  </span>

                  <span>
                    {item.q}
                  </span>
                </div>

                <div className="faq-answer">
                  {item.a}
                </div>
              </article>
            ))}

          </div>

        </section>

        <section className="rules-notice">

          <div className="rules-notice-title">
            Backend Rules Remain Authoritative
          </div>

          <div className="rules-notice-text">
            The Rules / FAQ page is informational. Contest state,
            scenario access, submission handling and other
            enforcement decisions remain controlled by the
            contest backend.
          </div>

        </section>

        <footer className="rules-footer">
          Use the Messages / Support section when a legitimate
          technical issue prevents investigation or submission.
          Do not attempt to bypass contest access controls.
        </footer>

      </div>
    </main>
  );
}
TSX

echo "[OK] Rules page installed."

echo "[4/7] Validating Rules markers..."

grep -q "Rules & FAQ" "$PAGE"
grep -q "Contest Rules" "$PAGE"
grep -q "Frequently Asked Questions" "$PAGE"
grep -q "Backend Rules Remain Authoritative" "$PAGE"
grep -q "rules-ui.css" "$PAGE"

echo "[OK] Rules markers verified."

echo "[5/7] Running production build..."

cd "$FRONTEND"

if npm run build; then
    echo "[BUILD SUCCESS]"
else
    echo
    echo "[BUILD FAILED]"
    echo "[ROLLBACK] Restoring previous Rules page..."

    if [ -f "$BACKUP/page.tsx" ]; then
        cp "$BACKUP/page.tsx" "$PAGE"
    fi

    if [ -f "$BACKUP/rules-ui.css" ]; then
        cp "$BACKUP/rules-ui.css" "$CSS"
    else
        rm -f "$CSS"
    fi

    echo "[ROLLBACK COMPLETE]"
    exit 1
fi

echo "[6/7] Checking installed files..."

ls -lh "$PAGE"
ls -lh "$CSS"

echo "[7/7] Phase 7 completed successfully."

echo
echo "============================================================"
echo " RULES / FAQ UI READY"
echo "============================================================"
echo
echo "URL:"
echo "  http://localhost:3000/student/rules"
echo
echo "Backup:"
echo "  $BACKUP"
echo
echo "Next:"
echo "  Restart dev server and hard refresh the browser."
echo
echo "============================================================"
