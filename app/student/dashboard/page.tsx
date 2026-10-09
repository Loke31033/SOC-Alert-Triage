"use client";

import "./dashboard-soc.css";

import { useEffect, useMemo, useState } from "react";

type Result = {
  scenario_id: string;
  score: number;
  maximum_marks: number;
  percentage: string | number;
  submitted_at: string;
};

type Scenario = {
  id: string;
  name: string;
  description: string;
  route: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "scenario01",
    name: "SSH Brute Force",
    description:
      "Investigate authentication failures, identify the attack source and determine whether compromise occurred.",
    route: "/student/scenario01",
  },
  {
    id: "scenario02",
    name: "Credential Attack",
    description:
      "Correlate authentication activity and determine suspicious credential-based behavior.",
    route: "/student/scenario02",
  },
  {
    id: "scenario03",
    name: "Malicious Activity",
    description:
      "Analyze endpoint and network indicators to identify the suspicious activity chain.",
    route: "/student/scenario03",
  },
  {
    id: "scenario04",
    name: "Exfiltration",
    description:
      "Investigate post-compromise behavior and determine whether sensitive data was exfiltrated.",
    route: "/student/scenario04",
  },
];

export default function StudentDashboard() {
  const [teamId, setTeamId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedTeamId =
      sessionStorage.getItem("student_team_id") || "";

    const storedTeamName =
      sessionStorage.getItem("student_team_name") || "";

    setTeamId(storedTeamId);
    setTeamName(storedTeamName);
  }, []);

  useEffect(() => {
    if (!teamId) {
      return;
    }

    setLoading(true);
    setError("");

    fetch(
      `/api/student/dashboard?team_id=${encodeURIComponent(teamId)}`,
      {
        credentials: "include",
        cache: "no-store",
      }
    )
      .then(async (response) => {
        const contentType =
          response.headers.get("content-type") || "";

        const rawResponse = await response.text();

        if (!contentType.includes("application/json")) {
          throw new Error(
            `Dashboard API returned a non-JSON response (HTTP ${response.status}).`
          );
        }

        let data: any;

        try {
          data = JSON.parse(rawResponse);
        } catch {
          throw new Error(
            `Dashboard API returned invalid JSON (HTTP ${response.status}).`
          );
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Unable to load dashboard."
          );
        }

        setTeamName(data.team_name || storedTeamName());
        setResults(data.results || []);
      })
      .catch((err) => {
        console.error("[STUDENT DASHBOARD ERROR]", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [teamId]);

  const getResult = (scenarioId: string) =>
    results.find(
      (result) => result.scenario_id === scenarioId
    );

  const totalScore = useMemo(
    () =>
      results.reduce(
        (sum, result) => sum + Number(result.score || 0),
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

  const completed = results.length;

  const overallPercentage =
    totalMarks > 0
      ? Math.round((totalScore / totalMarks) * 100)
      : 0;

  const progress =
    Math.round((completed / SCENARIOS.length) * 100);

  if (loading) {
    return (
      <main className="dashboard-soc">
        <div className="dashboard-container">
          <div className="dashboard-loading">
            LOADING SOC DASHBOARD...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-soc">
      <div className="dashboard-container">

        <header className="dashboard-topbar">
          <div>
            <h1 className="dashboard-title">
              SOC CONTEST DASHBOARD
            </h1>

            <p className="dashboard-subtitle">
              Security Operations Center Investigation Platform
            </p>
          </div>

          <div className="dashboard-status">
            <span className="status-dot" />
            CONTEST ACTIVE
          </div>
        </header>

        {error ? (
          <div className="dashboard-error">
            <strong>Dashboard Error</strong>
            <div>{error}</div>
          </div>
        ) : (
          <>
            <section className="team-panel">
              <div className="team-label">
                OPERATING TEAM
              </div>

              <div className="team-id">
                {teamId || "UNKNOWN"}
              </div>

              <div className="team-name">
                {teamName || "Student Security Team"}
              </div>
            </section>

            <section className="metrics-grid">
              <article className="metric-card">
                <div className="metric-label">
                  Total Score
                </div>

                <div className="metric-value">
                  {totalScore}
                </div>

                <div className="metric-detail">
                  / {totalMarks || 0} marks
                </div>
              </article>

              <article className="metric-card">
                <div className="metric-label">
                  Performance
                </div>

                <div className="metric-value">
                  {overallPercentage}%
                </div>

                <div className="metric-detail">
                  Overall accuracy
                </div>
              </article>

              <article className="metric-card">
                <div className="metric-label">
                  Completed
                </div>

                <div className="metric-value">
                  {completed}/{SCENARIOS.length}
                </div>

                <div className="metric-detail">
                  Scenarios investigated
                </div>
              </article>

              <article className="metric-card">
                <div className="metric-label">
                  Progress
                </div>

                <div className="metric-value">
                  {progress}%
                </div>

                <div className="metric-detail">
                  Contest completion
                </div>
              </article>
            </section>

            <section>
              <div className="section-header">
                <h2 className="section-title">
                  INVESTIGATION SCENARIOS
                </h2>

                <span className="section-meta">
                  {completed} of {SCENARIOS.length} completed
                </span>
              </div>

              <div className="progress-shell">
                <div
                  className="progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="scenario-grid">
                {SCENARIOS.map((scenario, index) => {
                  const result =
                    getResult(scenario.id);

                  const completedScenario =
                    Boolean(result);

                  return (
                    <article
                      key={scenario.id}
                      className={`scenario-card ${
                        completedScenario
                          ? "completed"
                          : ""
                      }`}
                    >
                      <div className="scenario-head">
                        <div>
                          <div className="scenario-number">
                            SCENARIO {String(index + 1).padStart(2, "0")}
                          </div>

                          <div className="scenario-name">
                            {scenario.name}
                          </div>
                        </div>

                        <div className="scenario-status">
                          {completedScenario
                            ? "COMPLETED"
                            : "AVAILABLE"}
                        </div>
                      </div>

                      <p className="scenario-description">
                        {scenario.description}
                      </p>

                      <div className="scenario-footer">
                        <div className="scenario-score">
                          {completedScenario ? (
                            <>
                              SCORE:{" "}
                              <strong>
                                {result?.score ?? 0}
                              </strong>
                            </>
                          ) : (
                            "NOT INVESTIGATED"
                          )}
                        </div>

                        <a
                          className="scenario-button"
                          href={scenario.route}
                        >
                          {completedScenario
                            ? "REVIEW"
                            : "INVESTIGATE"}
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function storedTeamName() {
  return (
    sessionStorage.getItem("student_team_name") || ""
  );
}
