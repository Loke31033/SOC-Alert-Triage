"use client";
import "./student-home.css";

import { useEffect, useState } from "react";
type ScenarioStatus = "available" | "locked" | "completed";

interface Scenario {
  id: string;
  name: string;
  description: string;
  status: ScenarioStatus;
  questions: number;
  marks: number;
}

const scenarios: Scenario[] = [
  {
    id: "scenario01",
    name: "Scenario 01",
    description:
      "SSH Brute Force → Successful Login → Post-Compromise → Exfiltration",
    status: "available",
    questions: 10,
    marks: 100,
  },
  {
    id: "scenario02",
    name: "Scenario 02",
    status: "available",
    description: "Security investigation scenario",
    questions: 10,
    marks: 100,
  },
  {
    id: "scenario03",
    name: "Scenario 03",
    status: "available",
    description: "Security investigation scenario",
    questions: 10,
    marks: 100,
  },
  {
    id: "scenario04",
    name: "Scenario 04",
    status: "available",
    description: "Security investigation scenario",
    questions: 10,
    marks: 100,
  },
];

export default function StudentDashboard() {
  const [teamId, setTeamId] = useState("");

  useEffect(() => {
    const storedTeamId = sessionStorage.getItem("student_team_id");
    if (storedTeamId) {
      setTeamId(storedTeamId);
    }
  }, []);


  function openScenario(scenario: Scenario) {
    if (scenario.status !== "available") {
      return;
    }

    window.location.href = `/student/${scenario.id}`;
  }

  function logout() {
    window.location.href = "/";
  }

  return (
    <main className="dashboard-page student-home-page">

      {/* Header */}
      <header className="dashboard-header">

        <div>
          <div className="dashboard-brand">
            SOC ALERT TRIAGE CONTEST
          </div>

          <div className="dashboard-subtitle">
            Security Operations Center Investigation Platform
          </div>
        </div>

        <div className="team-section">

          <div className="team-info">
            <span>TEAM</span>
            <strong>{teamId}</strong>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            LOGOUT
          </button>

        </div>

      </header>

      {/* Main content */}
      <section className="dashboard-content">

        <div className="welcome-section">

          <div>
            <h1>Investigation Dashboard</h1>

            <p>
              Select an available scenario to begin your SOC investigation.
            </p>
          </div>

          <div className="contest-status">
            <span className="status-dot"></span>
            CONTEST ACTIVE
          </div>

        </div>

        {/* Statistics */}
        <section className="stats-grid">

          <div className="stat-card">
            <span className="stat-label">
              TEAM
            </span>

            <strong>
              {teamId}
            </strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              SCENARIOS
            </span>

            <strong>
              4
            </strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              QUESTIONS
            </span>

            <strong>
              40
            </strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">
              MAX SCORE
            </span>

            <strong>
              400
            </strong>
          </div>

        </section>

        {/* Scenarios */}
        <section className="scenario-section">

          <div className="section-heading">
            <h2>Investigation Scenarios</h2>

            <span>
              4 Scenarios
            </span>
          </div>

          <div className="scenario-grid">

            {scenarios.map((scenario) => (

              <div
                key={scenario.id}
                className={`scenario-card ${scenario.status}`}
              >

                <div className="scenario-top">

                  <span className="scenario-id">
                    {scenario.id.toUpperCase()}
                  </span>

                  {scenario.status === "available" && (
                    <span className="available-badge">
                      AVAILABLE
                    </span>
                  )}

                  {scenario.status === "locked" && (
                    <span className="locked-badge">
                      LOCKED
                    </span>
                  )}

                  {scenario.status === "completed" && (
                    <span className="completed-badge">
                      COMPLETED
                    </span>
                  )}

                </div>

                <h3>
                  {scenario.name}
                </h3>

                <p className="scenario-description">
                  {scenario.description}
                </p>

                <div className="scenario-meta">

                  <span>
                    {scenario.questions} Questions
                  </span>

                  <span>
                    {scenario.marks} Marks
                  </span>

                </div>

                <button
                  className="scenario-button"
                  disabled={scenario.status !== "available"}
                  onClick={() => openScenario(scenario)}
                >
                  {scenario.status === "available"
                    ? "START INVESTIGATION"
                    : scenario.status === "locked"
                    ? "LOCKED"
                    : "VIEW RESULT"}
                </button>

              </div>

            ))}

          </div>

        </section>

        {/* Investigation workflow */}
        <section className="workflow-section">

          <div className="section-heading">
            <h2>Investigation Workflow</h2>
          </div>

          <div className="workflow-grid">

            <div className="workflow-step">
              <span>01</span>
              <strong>Investigate</strong>
              <p>
                Analyze the provided SOC dataset using Kibana.
              </p>
            </div>

            <div className="workflow-step">
              <span>02</span>
              <strong>Analyze</strong>
              <p>
                Identify attack activity, timeline and evidence.
              </p>
            </div>

            <div className="workflow-step">
              <span>03</span>
              <strong>Answer</strong>
              <p>
                Complete the scenario investigation questions.
              </p>
            </div>

            <div className="workflow-step">
              <span>04</span>
              <strong>Submit</strong>
              <p>
                Submit your answers for automated evaluation.
              </p>
            </div>

          </div>

        </section>

      </section>

    </main>
  );
}
