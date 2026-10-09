"use client";

import { useEffect, useState } from "react";

type Scenario = {
  scenario_id: string;
  submitted: boolean;
  score: number;
  maximum_marks: number;
  percentage: number;
  submitted_at: string | null;
};

type Submission = {
  scenario_id: string;
  score: number;
  maximum_marks: number;
  percentage: number;
  submitted_at: string;
};

type QuestionResult = {
  question_id: string;
  selected_answer: string | null;
  correct: boolean;
  marks_awarded: number;
};

type QuestionDetail = {
  success: boolean;
  team_id: string;
  scenario_id: string;
  score: number;
  maximum_marks: number;
  percentage: number;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  question_results: QuestionResult[];
  submitted_at: string | null;
};

type TeamData = {
  team: {
    team_id: string;
    team_name: string | null;
  };

  overview: {
    total_score: number;
    maximum_marks: number;
    percentage: number;
    completed_scenarios: number;
    total_scenarios: number;
    pending_scenarios: number;
  };

  scenarios: Scenario[];
  submission_history: Submission[];
};

export default function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const [data, setData] = useState<TeamData | null>(null);

  const [selectedScenario, setSelectedScenario] =
    useState<string | null>(null);

  const [questionDetail, setQuestionDetail] =
    useState<QuestionDetail | null>(null);

  const [questionLoading, setQuestionLoading] =
    useState(false);

  const [questionError, setQuestionError] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTeam() {
      try {
        const { teamId } = await params;

        const response = await fetch(
          `/api/admin/teams/${teamId}`,
          {
            cache: "no-store",
          }
        );

        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(
            json.error || "Unable to load team."
          );
        }

        setData(json);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load team details."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading team details...
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="bg-red-950 border border-red-700 rounded-xl p-6">
          <h1 className="text-xl font-bold mb-2">
            Team Detail Error
          </h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!data) return null;

  const teamId = data.team.team_id;

  async function openScenario(scenarioId: string) {
    setSelectedScenario(scenarioId);
    setQuestionDetail(null);
    setQuestionError("");
    setQuestionLoading(true);

    try {
      const response = await fetch(
        `/api/admin/teams/${teamId}/${scenarioId}`,
        {
          cache: "no-store",
        }
      );

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(
          json.error ||
            "Unable to load question-level result."
        );
      }

      setQuestionDetail(json);
    } catch (err) {
      console.error(err);

      setQuestionError(
        err instanceof Error
          ? err.message
          : "Unable to load question-level result."
      );
    } finally {
      setQuestionLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <a
            href="/admin/dashboard"
            className="text-blue-400 hover:text-blue-300"
          >
            ← Back to Admin Dashboard
          </a>

          <p className="text-blue-400 font-semibold mt-6">
            SOC ALERT TRIAGE CONTEST
          </p>

          <h1 className="text-4xl font-bold mt-2">
            {data.team.team_name || data.team.team_id}
          </h1>

          <p className="text-slate-400 mt-2">
            Team ID: {data.team.team_id}
          </p>
        </div>

        {/* OVERVIEW */}

        <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            <p className="text-slate-400 text-sm">
              Total Score
            </p>
            <p className="text-3xl font-bold mt-2">
              {data.overview.total_score}
              <span className="text-lg text-slate-500">
                {" "} / {data.overview.maximum_marks}
              </span>
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            <p className="text-slate-400 text-sm">
              Percentage
            </p>
            <p className="text-3xl font-bold mt-2">
              {data.overview.percentage}%
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            <p className="text-slate-400 text-sm">
              Completed
            </p>
            <p className="text-3xl font-bold mt-2">
              {data.overview.completed_scenarios}
              {" / "}
              {data.overview.total_scenarios}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            <p className="text-slate-400 text-sm">
              Pending
            </p>
            <p className="text-3xl font-bold mt-2">
              {data.overview.pending_scenarios}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            <p className="text-slate-400 text-sm">
              Status
            </p>
            <p className="text-xl font-bold mt-3 text-green-400">
              {data.overview.pending_scenarios === 0
                ? "COMPLETED"
                : "IN PROGRESS"}
            </p>
          </div>

        </section>

        {/* FOUR SCENARIOS */}

        <section className="mb-10">

          <h2 className="text-2xl font-bold mb-5">
            Scenario Progress
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            {data.scenarios.map((scenario) => (

              <button
                type="button"
                key={scenario.scenario_id}
                disabled={!scenario.submitted}
                onClick={() =>
                  scenario.submitted &&
                  openScenario(scenario.scenario_id)
                }
                className="w-full text-left bg-slate-900 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition disabled:hover:border-slate-700 disabled:cursor-default"
              >

                <div className="flex justify-between items-start gap-4">

                  <div>
                    <h3 className="text-xl font-bold">
                      {scenario.scenario_id.toUpperCase()}
                    </h3>

                    <p className="text-slate-400 mt-1">
                      {scenario.submitted
                        ? "Submission received"
                        : "Not submitted"}
                    </p>
                  </div>

                  <span
                    className={
                      scenario.submitted
                        ? "bg-green-950 text-green-400 border border-green-700 px-3 py-1 rounded-full text-sm"
                        : "bg-yellow-950 text-yellow-400 border border-yellow-700 px-3 py-1 rounded-full text-sm"
                    }
                  >
                    {scenario.submitted
                      ? "SUBMITTED"
                      : "PENDING"}
                  </span>

                </div>

                <div className="mt-6">

                  <div className="flex justify-between mb-2">
                    <span className="text-slate-400">
                      Score
                    </span>

                    <span className="font-bold">
                      {scenario.score} /{" "}
                      {scenario.maximum_marks}
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">

                    <div
                      className="h-3 bg-blue-600 rounded-full"
                      style={{
                        width: `${Math.min(
                          scenario.percentage,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                  <div className="flex justify-between mt-3 text-sm">

                    <span className="text-slate-400">
                      Percentage
                    </span>

                    <span className="font-semibold">
                      {scenario.percentage}%
                    </span>

                  </div>

                </div>

                {scenario.submitted &&
                  scenario.submitted_at && (
                    <p className="text-xs text-slate-500 mt-5">
                      Submitted:{" "}
                      {new Date(
                        scenario.submitted_at
                      ).toLocaleString()}
                    </p>
                  )}

              </button>

            ))}

          </div>

        </section>

        {/* QUESTION-LEVEL RESULT */}

        {selectedScenario && (
          <section className="mb-10">

            <div className="flex items-center justify-between mb-5">

              <h2 className="text-2xl font-bold">
                Question-Level Result —{" "}
                {selectedScenario.toUpperCase()}
              </h2>

              <button
                type="button"
                onClick={() => {
                  setSelectedScenario(null);
                  setQuestionDetail(null);
                  setQuestionError("");
                }}
                className="text-slate-400 hover:text-white"
              >
                Close
              </button>

            </div>

            {questionLoading && (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 text-center text-slate-400">
                Loading evaluator result...
              </div>
            )}

            {questionError && (
              <div className="bg-red-950 border border-red-700 rounded-xl p-6">
                <h3 className="font-bold text-red-300">
                  Unable to load result
                </h3>
                <p className="text-red-200 mt-2">
                  {questionError}
                </p>
              </div>
            )}

            {questionDetail && !questionLoading && (
              <>
                <div className="grid sm:grid-cols-4 gap-4 mb-6">

                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                    <p className="text-slate-400 text-sm">
                      Score
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {questionDetail.score}/
                      {questionDetail.maximum_marks}
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                    <p className="text-slate-400 text-sm">
                      Percentage
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {questionDetail.percentage}%
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                    <p className="text-slate-400 text-sm">
                      Correct
                    </p>
                    <p className="text-2xl font-bold text-green-400 mt-1">
                      {questionDetail.correct_answers}
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                    <p className="text-slate-400 text-sm">
                      Incorrect
                    </p>
                    <p className="text-2xl font-bold text-red-400 mt-1">
                      {questionDetail.incorrect_answers}
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

                          <th className="px-5 py-4 text-center">
                            Selected Answer
                          </th>

                          <th className="px-5 py-4 text-center">
                            Result
                          </th>

                          <th className="px-5 py-4 text-center">
                            Marks
                          </th>
                        </tr>

                      </thead>

                      <tbody>

                        {questionDetail.question_results.map(
                          (question) => (

                            <tr
                              key={question.question_id}
                              className="border-t border-slate-800"
                            >

                              <td className="px-5 py-4 font-semibold">
                                {question.question_id}
                              </td>

                              <td className="px-5 py-4 text-center font-mono">
                                {question.selected_answer || "—"}
                              </td>

                              <td className="px-5 py-4 text-center">

                                {question.correct ? (
                                  <span className="inline-block bg-green-950 text-green-400 border border-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                    CORRECT
                                  </span>
                                ) : (
                                  <span className="inline-block bg-red-950 text-red-400 border border-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                                    INCORRECT
                                  </span>
                                )}

                              </td>

                              <td className="px-5 py-4 text-center font-semibold">
                                {question.marks_awarded}
                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>
              </>
            )}

          </section>
        )}

        {/* SUBMISSION HISTORY */}

        <section>

          <h2 className="text-2xl font-bold mb-5">
            Submission History
          </h2>

          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-800">

                  <tr>
                    <th className="px-5 py-4 text-left">
                      Scenario
                    </th>

                    <th className="px-5 py-4 text-center">
                      Score
                    </th>

                    <th className="px-5 py-4 text-center">
                      Percentage
                    </th>

                    <th className="px-5 py-4 text-left">
                      Submitted At
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {data.submission_history.length === 0 ? (

                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-slate-500"
                      >
                        No submissions yet.
                      </td>
                    </tr>

                  ) : (

                    data.submission_history.map(
                      (submission, index) => (

                        <tr
                          key={`${submission.scenario_id}-${submission.submitted_at}-${index}`}
                          className="border-t border-slate-800"
                        >

                          <td className="px-5 py-4 font-semibold">
                            {submission.scenario_id}
                          </td>

                          <td className="px-5 py-4 text-center">
                            {submission.score} /{" "}
                            {submission.maximum_marks}
                          </td>

                          <td className="px-5 py-4 text-center">
                            {submission.percentage}%
                          </td>

                          <td className="px-5 py-4 text-slate-400">
                            {new Date(
                              submission.submitted_at
                            ).toLocaleString()}
                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}
