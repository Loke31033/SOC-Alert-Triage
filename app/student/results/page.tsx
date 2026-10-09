"use client";

import "./results-ui.css";

import { useEffect, useMemo, useState } from "react";

type Result = {
  scenario_id: string;
  score: number;
  maximum_marks: number;
  percentage: string | number;
  submitted_at: string;
};

type ResultsResponse = {
  success?: boolean;
  results?: Result[];
  error?: string;
};

const SCENARIOS = [
  {
    id: "scenario01",
    name: "SSH Brute Force",
    description:
      "Authentication failures, successful login and post-compromise investigation.",
  },
  {
    id: "scenario02",
    name: "Credential Attack",
    description:
      "Credential-based suspicious activity and authentication analysis.",
  },
  {
    id: "scenario03",
    name: "Malicious Activity",
    description:
      "Endpoint and network indicators associated with malicious activity.",
  },
  {
    id: "scenario04",
    name: "Exfiltration",
    description:
      "Post-compromise behavior and potential sensitive-data exfiltration.",
  },
];

function formatScenario(value: string) {
  const match = value.match(/^scenario(\d+)$/i);

  if (!match) {
    return value;
  }

  return `Scenario ${match[1].padStart(2, "0")}`;
}

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function getPercentage(result?: Result) {
  if (!result) return 0;

  const percentage = Number(result.percentage);

  if (Number.isFinite(percentage)) {
    return Math.round(percentage);
  }

  const maximum = Number(result.maximum_marks || 0);

  if (maximum <= 0) {
    return 0;
  }

  return Math.round(
    (Number(result.score || 0) / maximum) * 100
  );
}

export default function StudentResultsPage() {
  const [teamId, setTeamId] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const id =
      sessionStorage.getItem("student_team_id") || "";

    setTeamId(id);

    if (!id) {
      setError("Student team session was not found.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadResults() {
      try {
        const response = await fetch(
          `/api/student/results/${encodeURIComponent(id)}`,
          {
            method: "GET",
            cache: "no-store",
            credentials: "include",
          }
        );

        const rawResponse = await response.text();

        let json: ResultsResponse;

        try {
          json = JSON.parse(rawResponse);
        } catch {
          throw new Error(
            `Results API returned invalid JSON (HTTP ${response.status}).`
          );
        }

        if (!response.ok || !json.success) {
          throw new Error(
            json.error || "Unable to load results."
          );
        }

        if (!cancelled) {
          setResults(
            Array.isArray(json.results)
              ? json.results
              : []
          );

          setError("");
          setLoading(false);
        }
      } catch (err) {
        console.error(
          "[STUDENT RESULTS ERROR]",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load results."
          );

          setLoading(false);
        }
      }
    }

    loadResults();

    const refreshTimer = window.setInterval(
      loadResults,
      5000
    );

    return () => {
      cancelled = true;
      window.clearInterval(refreshTimer);
    };
  }, []);

  const totalScore = useMemo(
    () =>
      results.reduce(
        (sum, result) =>
          sum + Number(result.score || 0),
        0
      ),
    [results]
  );

  const totalMarks = useMemo(
    () =>
      results.reduce(
        (sum, result) =>
          sum + Number(result.maximum_marks || 0),
        0
      ),
    [results]
  );

  const overallPercentage =
    totalMarks > 0
      ? Math.round(
          (totalScore / totalMarks) * 100
        )
      : 0;

  const completed = results.length;

  const progress = Math.round(
    (completed / SCENARIOS.length) * 100
  );

  const getResult = (scenarioId: string) =>
    results.find(
      (result) =>
        result.scenario_id === scenarioId
    );

  if (loading) {
    return (
      <main className="results-console">
        <div className="results-loading">
          <div className="results-spinner" />

          <div>
            LOADING INVESTIGATION RESULTS...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="results-console">
        <div className="results-wrapper">

          <section className="results-error">

            <div className="result-kicker">
              RESULTS SYSTEM
            </div>

            <h1>
              Unable to load results
            </h1>

            <p>{error}</p>

            <button
              type="button"
              className="results-action"
              onClick={() =>
                window.location.reload()
              }
            >
              RETRY
            </button>

          </section>

        </div>
      </main>
    );
  }

  return (
    <main className="results-console">

      <div className="results-wrapper">

        {/* TOP BAR */}

        <header className="results-topbar">

          <div>
            <div className="results-brand">
              SOC ALERT TRIAGE CONTEST
            </div>

            <div className="results-subtitle">
              SECURITY OPERATIONS CENTER
              <span>/</span>
              INVESTIGATION RESULTS
            </div>
          </div>

          <div className="results-team-box">
            <span>TEAM</span>

            <strong>
              {teamId || "UNKNOWN"}
            </strong>
          </div>

        </header>

        {/* PAGE HEADER */}

        <section className="results-header">

          <div>

            <div className="result-kicker">
              INVESTIGATION REPORT
            </div>

            <h1>
              Mission Results
            </h1>

            <p>
              Review completed SOC investigations,
              scores and contest progress.
            </p>

          </div>

          <div className="results-live-status">
            <span className="live-dot" />
            RESULTS AVAILABLE
          </div>

        </section>

        {/* METRICS */}

        <section className="results-metrics">

          <article className="result-metric">
            <span>TOTAL SCORE</span>

            <strong>
              {totalScore}
            </strong>

            <small>
              / {totalMarks || 0} marks
            </small>
          </article>

          <article className="result-metric">
            <span>PERFORMANCE</span>

            <strong>
              {overallPercentage}%
            </strong>

            <small>
              Overall accuracy
            </small>
          </article>

          <article className="result-metric">
            <span>COMPLETED</span>

            <strong>
              {completed}
              <em>/ {SCENARIOS.length}</em>
            </strong>

            <small>
              Scenarios investigated
            </small>
          </article>

          <article className="result-metric">
            <span>PROGRESS</span>

            <strong>
              {progress}%
            </strong>

            <small>
              Contest completion
            </small>
          </article>

        </section>

        {/* PROGRESS */}

        <section className="results-progress-card">

          <div className="results-section-heading">

            <div>
              <span>
                CONTEST PROGRESS
              </span>

              <h2>
                Investigation Completion
              </h2>
            </div>

            <strong>
              {completed}/{SCENARIOS.length}
            </strong>

          </div>

          <div className="progress-track">

            <div
              className="progress-fill"
              style={{
                width: `${Math.min(
                  100,
                  progress
                )}%`,
              }}
            />

          </div>

        </section>

        {/* SCENARIOS */}

        <section className="scenario-results-section">

          <div className="results-section-heading">

            <div>
              <span>
                SCENARIO ANALYSIS
              </span>

              <h2>
                Investigation Results
              </h2>
            </div>

            <span className="section-count">
              {completed} COMPLETED
            </span>

          </div>

          <div className="scenario-results-grid">

            {SCENARIOS.map(
              (scenario, index) => {

                const result =
                  getResult(scenario.id);

                const score =
                  Number(
                    result?.score || 0
                  );

                const maximumMarks =
                  Number(
                    result?.maximum_marks || 0
                  );

                const scenarioPercentage =
                  getPercentage(result);

                const isComplete =
                  Boolean(result);

                return (
                  <article
                    key={scenario.id}
                    className={`scenario-result-card ${
                      isComplete
                        ? "is-complete"
                        : "is-pending"
                    }`}
                  >

                    <div className="scenario-card-top">

                      <div className="scenario-index">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </div>

                      <div
                        className={`scenario-status ${
                          isComplete
                            ? "complete"
                            : "pending"
                        }`}
                      >
                        <span />

                        {isComplete
                          ? "COMPLETED"
                          : "NOT STARTED"}
                      </div>

                    </div>

                    <div className="scenario-result-body">

                      <div className="scenario-label">
                        {formatScenario(
                          scenario.id
                        )}
                      </div>

                      <h3>
                        {scenario.name}
                      </h3>

                      <p>
                        {scenario.description}
                      </p>

                    </div>

                    <div className="scenario-score-panel">

                      {isComplete ? (
                        <>
                          <div>
                            <span>
                              SCORE
                            </span>

                            <strong>
                              {score}
                              <small>
                                / {maximumMarks}
                              </small>
                            </strong>
                          </div>

                          <div className="scenario-percent">
                            {scenarioPercentage}%
                          </div>
                        </>
                      ) : (
                        <div className="not-started">
                          INVESTIGATION
                          NOT COMPLETED
                        </div>
                      )}

                    </div>

                    {isComplete && (
                      <div className="scenario-submitted">

                        <span>
                          SUBMITTED
                        </span>

                        <span>
                          {formatDate(
                            result?.submitted_at || ""
                          )}
                        </span>

                      </div>
                    )}

                  </article>
                );
              }
            )}

          </div>

        </section>

        {/* DETAILED TABLE */}

        <section className="results-table-section">

          <div className="results-section-heading">

            <div>
              <span>
                SCOREBOARD
              </span>

              <h2>
                Detailed Results
              </h2>
            </div>

          </div>

          <div className="results-table-wrapper">

            <table className="results-table">

              <thead>

                <tr>
                  <th>SCENARIO</th>
                  <th>STATUS</th>
                  <th>SCORE</th>
                  <th>PERFORMANCE</th>
                  <th>SUBMITTED</th>
                </tr>

              </thead>

              <tbody>

                {SCENARIOS.map(
                  (scenario) => {

                    const result =
                      getResult(
                        scenario.id
                      );

                    return (
                      <tr
                        key={
                          scenario.id
                        }
                      >

                        <td>
                          <strong>
                            {formatScenario(
                              scenario.id
                            )}
                          </strong>

                          <span>
                            {scenario.name}
                          </span>
                        </td>

                        <td>

                          <span
                            className={`table-status ${
                              result
                                ? "complete"
                                : "pending"
                            }`}
                          >
                            {result
                              ? "COMPLETED"
                              : "PENDING"}
                          </span>

                        </td>

                        <td>
                          {result ? (
                            <strong>
                              {result.score}

                              <small>
                                /
                                {
                                  result.maximum_marks
                                }
                              </small>
                            </strong>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td>
                          {result
                            ? `${getPercentage(
                                result
                              )}%`
                            : "—"}
                        </td>

                        <td>
                          {result
                            ? formatDate(
                                result.submitted_at
                              )
                            : "—"}
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* FOOTER */}

        <footer className="results-footer">

          <span>
            SOC ALERT TRIAGE CONTEST
          </span>

          <span>
            TEAM {teamId || "UNKNOWN"}
          </span>

          <span>
            RESULTS SYSTEM ONLINE
          </span>

        </footer>

      </div>

    </main>
  );
}
