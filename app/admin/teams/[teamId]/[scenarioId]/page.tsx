"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type QuestionResult = {
  question_id: string;
  selected_answer: string;
  correct_answer: string;
  correct: boolean;
  marks_awarded: number;
  maximum_marks: number;
};

type Submission = {
  id?: number;
  score: number;
  maximum_marks: number;
  percentage: number;
  submitted_at: string;
};

type DetailResponse = {
  success: boolean;
  team?: {
    team_id: string;
    team_name: string | null;
  };
  scenario?: {
    scenario_id: string;
    scenario_name?: string;
  };
  submission?: Submission;
  question_results?: QuestionResult[];
  questions?: QuestionResult[];
  error?: string;
};

export default function AdminScenarioDetailPage() {
  const params = useParams();
  const router = useRouter();

  const teamId = String(params.teamId);
  const scenarioId = String(params.scenarioId);

  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadScenario() {
      try {
        const response = await fetch(
          `/api/admin/teams/${encodeURIComponent(teamId)}/${encodeURIComponent(
            scenarioId
          )}`,
          {
            cache: "no-store",
          }
        );

        const json: DetailResponse = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(
            json.error || "Unable to load scenario details."
          );
        }

        setData(json);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load scenario details."
        );
      } finally {
        setLoading(false);
      }
    }

    loadScenario();
  }, [teamId, scenarioId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">
          Loading question-level results...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-6 text-blue-400 hover:text-blue-300"
          >
            ← Back
          </button>

          <div className="bg-red-950 border border-red-700 rounded-xl p-6">
            <h1 className="text-xl font-bold mb-2">
              Unable to Load Scenario
            </h1>

            <p className="text-red-200">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const questions =
    data.question_results ||
    data.questions ||
    [];

  const submission = data.submission;

  const teamName =
    data.team?.team_name ||
    data.team?.team_id ||
    teamId;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <header className="mb-8">

          <button
            onClick={() => router.back()}
            className="text-blue-400 hover:text-blue-300 mb-5"
          >
            ← Back to Team
          </button>

          <p className="text-blue-400 font-semibold">
            SOC ALERT TRIAGE CONTEST
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Question-Level Review
          </h1>

          <p className="text-slate-400 mt-2">
            {teamName} · {scenarioId}
          </p>

        </header>

        {/* SUMMARY */}

        {submission && (
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
              <p className="text-slate-400 text-sm">
                Team
              </p>

              <p className="text-xl font-bold mt-2">
                {teamName}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                {teamId}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
              <p className="text-slate-400 text-sm">
                Scenario
              </p>

              <p className="text-xl font-bold mt-2">
                {scenarioId}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
              <p className="text-slate-400 text-sm">
                Score
              </p>

              <p className="text-3xl font-bold mt-2">
                {submission.score}
                <span className="text-lg text-slate-500">
                  {" "}
                  / {submission.maximum_marks}
                </span>
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
              <p className="text-slate-400 text-sm">
                Percentage
              </p>

              <p className="text-3xl font-bold mt-2">
                {Number(submission.percentage).toFixed(2)}%
              </p>
            </div>

          </section>
        )}

        {/* QUESTION RESULTS */}

        <section>

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-2xl font-bold">
                Question Results
              </h2>

              <p className="text-slate-400 mt-1">
                Stored evaluator results for {questions.length} questions.
              </p>
            </div>

          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-800">

                  <tr>
                    <th className="px-5 py-4 text-left">
                      Question
                    </th>

                    <th className="px-5 py-4 text-left">
                      Selected Answer
                    </th>

                    <th className="px-5 py-4 text-left">
                      Correct Answer
                    </th>

                    <th className="px-5 py-4 text-center">
                      Status
                    </th>

                    <th className="px-5 py-4 text-center">
                      Marks
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {questions.length === 0 ? (

                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        No question-level results found.
                      </td>
                    </tr>

                  ) : (

                    questions.map((question) => (

                      <tr
                        key={question.question_id}
                        className="border-t border-slate-800 hover:bg-slate-800/50"
                      >

                        <td className="px-5 py-4 font-semibold">
                          {question.question_id}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center justify-center min-w-10 px-3 py-1 rounded-lg bg-slate-800 font-semibold">
                            {question.selected_answer || "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center justify-center min-w-10 px-3 py-1 rounded-lg bg-slate-800 font-semibold">
                            {question.correct_answer || "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">

                          {question.correct ? (

                            <span className="inline-flex px-3 py-1 rounded-full bg-green-950 text-green-400 border border-green-800 font-semibold">
                              CORRECT
                            </span>

                          ) : (

                            <span className="inline-flex px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 font-semibold">
                              WRONG
                            </span>

                          )}

                        </td>

                        <td className="px-5 py-4 text-center font-semibold">

                          {question.marks_awarded}
                          <span className="text-slate-500">
                            {" "}
                            / {question.maximum_marks}
                          </span>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </section>

        {/* FOOTER */}

        {submission && (
          <div className="mt-6 text-sm text-slate-500">
            Submitted:{" "}
            {new Date(
              submission.submitted_at
            ).toLocaleString()}
          </div>
        )}

      </div>
    </main>
  );
}
