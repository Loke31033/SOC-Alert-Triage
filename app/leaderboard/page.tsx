"use client";

import { useEffect, useState } from "react";

type LeaderboardEntry = {
  rank: number;
  team_id: string;
  team_name: string;

  scenario01_score: number;
  scenario02_score: number;
  scenario03_score: number;
  scenario04_score: number;

  total_score: number;
  completed_scenarios: number;
};

export default function LeaderboardPage() {
  const [data, setData] =
    useState<LeaderboardEntry[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const response = await fetch(
          "/api/leaderboard",
          {
            cache: "no-store",
          }
        );

        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(
            json.error ||
              "Unable to load leaderboard."
          );
        }

        setData(json.leaderboard || []);

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

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading leaderboard...
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="bg-red-950 border border-red-700 rounded-xl p-6">
          <h1 className="text-xl font-bold mb-2">
            Leaderboard Error
          </h1>

          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10">

      <div className="max-w-7xl mx-auto">

        <header className="mb-10">

          <p className="text-blue-400 font-semibold">
            SOC ALERT TRIAGE CONTEST
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Live Leaderboard
          </h1>

          <p className="text-slate-400 mt-2">
            Team scores from completed investigations.
          </p>

        </header>

        <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-800">

                <tr>

                  <th className="px-5 py-4 text-left">
                    Rank
                  </th>

                  <th className="px-5 py-4 text-left">
                    Team
                  </th>

                  <th className="px-5 py-4 text-center">
                    S01
                  </th>

                  <th className="px-5 py-4 text-center">
                    S02
                  </th>

                  <th className="px-5 py-4 text-center">
                    S03
                  </th>

                  <th className="px-5 py-4 text-center">
                    S04
                  </th>

                  <th className="px-5 py-4 text-center">
                    Total
                  </th>

                  <th className="px-5 py-4 text-center">
                    Progress
                  </th>

                </tr>

              </thead>

              <tbody>

                {data.map((team) => (

                  <tr
                    key={team.team_id}
                    className="border-t border-slate-800 hover:bg-slate-800/50"
                  >

                    <td className="px-5 py-5 font-bold">
                      #{team.rank}
                    </td>

                    <td className="px-5 py-5">

                      <div className="font-semibold">
                        {team.team_name}
                      </div>

                      <div className="text-xs text-slate-500">
                        {team.team_id}
                      </div>

                    </td>

                    <td className="px-5 py-5 text-center">
                      {team.scenario01_score}
                    </td>

                    <td className="px-5 py-5 text-center">
                      {team.scenario02_score}
                    </td>

                    <td className="px-5 py-5 text-center">
                      {team.scenario03_score}
                    </td>

                    <td className="px-5 py-5 text-center">
                      {team.scenario04_score}
                    </td>

                    <td className="px-5 py-5 text-center">

                      <span className="font-bold text-blue-400">
                        {team.total_score}
                      </span>

                      <span className="text-slate-500">
                        {" "}/ 400
                      </span>

                    </td>

                    <td className="px-5 py-5 text-center">

                      {team.completed_scenarios} / 4

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        <p className="text-slate-500 text-sm mt-5">
          Scores are read directly from PostgreSQL
          submission records.
        </p>

      </div>

    </main>
  );
}
