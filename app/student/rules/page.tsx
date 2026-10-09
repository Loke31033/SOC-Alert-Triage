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
