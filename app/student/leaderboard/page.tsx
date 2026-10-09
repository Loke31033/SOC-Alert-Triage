"use client";

import "./leaderboard-ui.css";

import { useEffect, useMemo, useState } from "react";

type LeaderboardEntry = {
  rank: number;
  team_id: string;
  team_name?: string;
  score: number;
  completed_scenarios: number;
  percentage?: number;
};

export default function StudentLeaderboardPage() {
  const [entries, setEntries] =
    useState<LeaderboardEntry[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/leaderboard",
          {
            cache: "no-store",
            credentials: "include",
          }
        );

        const json = await response.json();

        if (!response.ok) {
          throw new Error(
            json.error ||
              "Unable to load leaderboard."
          );
        }

        const raw = Array.isArray(json)
          ? json
          : json.leaderboard ||
            json.results ||
            [];

        setEntries(raw);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load leaderboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, []);

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      if (a.rank !== b.rank) {
        return a.rank - b.rank;
      }

      return (
        Number(b.score || 0) -
        Number(a.score || 0)
      );
    });
  }, [entries]);

  const completedTeams = useMemo(
    () =>
      sortedEntries.filter(
        (entry) =>
          Number(
            entry.completed_scenarios || 0
          ) >= 4
      ).length,
    [sortedEntries]
  );

  const totalTeams = sortedEntries.length;

  const leader = sortedEntries[0];

  if (loading) {
    return (
      <main className="leaderboard-console">

        <div className="leaderboard-loading">

          <div className="leaderboard-spinner" />

          <p>
            LOADING LIVE RANKINGS...
          </p>

        </div>

      </main>
    );
  }

  if (error) {
    return (
      <main className="leaderboard-console">

        <div className="leaderboard-wrapper">

          <section className="leaderboard-error">

            <div className="leader-kicker">
              RANKING SYSTEM
            </div>

            <h1>
              Leaderboard unavailable
            </h1>

            <p>
              {error}
            </p>

            <button
              type="button"
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
    <main className="leaderboard-console">

      <div className="leaderboard-wrapper">

        {/* TOP BAR */}

        <header className="leaderboard-topbar">

          <div>

            <div className="leaderboard-brand">
              SOC ALERT TRIAGE CONTEST
            </div>

            <div className="leaderboard-subtitle">
              SECURITY OPERATIONS CENTER
              <span>/</span>
              LIVE TEAM RANKINGS
            </div>

          </div>

          <div className="ranking-status">

            <span className="ranking-live-dot" />

            LIVE RANKINGS

          </div>

        </header>

        {/* HEADER */}

        <section className="leaderboard-header">

          <div>

            <div className="leader-kicker">
              COMPETITION INTELLIGENCE
            </div>

            <h1>
              Leaderboard
            </h1>

            <p>
              Current team rankings based on
              submitted SOC investigation scores.
            </p>

          </div>

          <div className="ranking-count">

            <strong>
              {totalTeams}
            </strong>

            <span>
              TEAMS
            </span>

          </div>

        </section>

        {/* SUMMARY */}

        <section className="ranking-metrics">

          <article className="ranking-metric">

            <span>
              TEAMS COMPETING
            </span>

            <strong>
              {totalTeams}
            </strong>

            <small>
              Registered leaderboard entries
            </small>

          </article>

          <article className="ranking-metric">

            <span>
              SCENARIOS COMPLETED
            </span>

            <strong>
              {completedTeams}
            </strong>

            <small>
              Teams completing all 4
            </small>

          </article>

          <article className="ranking-metric">

            <span>
              CURRENT LEADER
            </span>

            <strong className="leader-name">
              {leader?.team_name ||
                leader?.team_id ||
                "—"}
            </strong>

            <small>
              {leader
                ? `${leader.score} points`
                : "No scores yet"}
            </small>

          </article>

          <article className="ranking-metric">

            <span>
              TOP RANK
            </span>

            <strong>
              {leader
                ? `#${leader.rank}`
                : "—"}
            </strong>

            <small>
              Current position
            </small>

          </article>

        </section>

        {/* PODIUM */}

        {sortedEntries.length > 0 && (

          <section className="podium-section">

            <div className="section-heading">

              <div>
                <span>
                  TOP OPERATORS
                </span>

                <h2>
                  Current Podium
                </h2>
              </div>

            </div>

            <div className="podium-grid">

              {sortedEntries
                .slice(0, 3)
                .map((entry, index) => {

                  const podiumPosition =
                    index + 1;

                  return (
                    <article
                      key={
                        entry.team_id
                      }
                      className={`podium-card position-${podiumPosition}`}
                    >

                      <div className="podium-rank">
                        #{entry.rank}
                      </div>

                      <div className="podium-medal">
                        {podiumPosition === 1
                          ? "01"
                          : podiumPosition === 2
                          ? "02"
                          : "03"}
                      </div>

                      <div className="podium-team">

                        <strong>
                          {entry.team_name ||
                            entry.team_id}
                        </strong>

                        <span>
                          {entry.team_id}
                        </span>

                      </div>

                      <div className="podium-score">

                        <strong>
                          {entry.score}
                        </strong>

                        <span>
                          POINTS
                        </span>

                      </div>

                      <div className="podium-progress">

                        <span>
                          {entry.completed_scenarios}
                          /4 SCENARIOS
                        </span>

                        <div>
                          <i
                            style={{
                              width: `${Math.min(
                                100,
                                (Number(
                                  entry.completed_scenarios ||
                                    0
                                ) /
                                  4) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>

                      </div>

                    </article>
                  );
                })}

            </div>

          </section>
        )}

        {/* FULL RANKING */}

        <section className="ranking-section">

          <div className="section-heading">

            <div>
              <span>
                FULL RANKING
              </span>

              <h2>
                Team Standings
              </h2>
            </div>

            <span className="ranking-meta">
              {totalTeams} ENTRIES
            </span>

          </div>

          <div className="ranking-table">

            <div className="ranking-table-head">

              <span>RANK</span>
              <span>TEAM</span>
              <span>SCORE</span>
              <span>PROGRESS</span>
              <span>STATUS</span>

            </div>

            {sortedEntries.map(
              (entry, index) => {

                const completed =
                  Number(
                    entry.completed_scenarios ||
                      0
                  );

                const progress =
                  Math.min(
                    100,
                    Math.round(
                      (completed / 4) *
                        100
                    )
                  );

                const isTop =
                  index < 3;

                return (
                  <div
                    key={entry.team_id}
                    className={`ranking-row ${
                      isTop
                        ? "top-ranked"
                        : ""
                    }`}
                  >

                    <div className="rank-cell">

                      <span
                        className={
                          isTop
                            ? "rank-highlight"
                            : ""
                        }
                      >
                        #{entry.rank}
                      </span>

                    </div>

                    <div className="team-cell">

                      <strong>
                        {entry.team_name ||
                          entry.team_id}
                      </strong>

                      <span>
                        {entry.team_id}
                      </span>

                    </div>

                    <div className="score-cell">

                      <strong>
                        {entry.score}
                      </strong>

                      <span>
                        POINTS
                      </span>

                    </div>

                    <div className="progress-cell">

                      <div className="progress-label">

                        <span>
                          {completed}/4
                        </span>

                        <span>
                          {progress}%
                        </span>

                      </div>

                      <div className="mini-progress">

                        <i
                          style={{
                            width: `${progress}%`,
                          }}
                        />

                      </div>

                    </div>

                    <div className="status-cell">

                      {completed >= 4 ? (
                        <span className="status-complete">
                          COMPLETED
                        </span>
                      ) : (
                        <span className="status-progress">
                          IN PROGRESS
                        </span>
                      )}

                    </div>

                  </div>
                );
              }
            )}

            {sortedEntries.length === 0 && (

              <div className="ranking-empty">

                <strong>
                  No leaderboard data
                </strong>

                <span>
                  Rankings will appear after
                  teams submit investigations.
                </span>

              </div>

            )}

          </div>

        </section>

        {/* FOOTER */}

        <footer className="leaderboard-footer">

          <span>
            SOC ALERT TRIAGE CONTEST
          </span>

          <span>
            RANKING ENGINE ONLINE
          </span>

          <span>
            LIVE DATA
          </span>

        </footer>

      </div>

    </main>
  );
}
