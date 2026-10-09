"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type QuestionResult = {
  question_id: string;
  selected_answer: string;
  correct_answer: string;
  correct: boolean;
  marks_awarded: number;
};

type SubmissionAudit = {
  id: number;
  team_id: string;
  scenario_id: string;
  submitted_at: string;

  stored_score: number;
  stored_maximum_marks: number;
  stored_percentage: number;

  answers: {
    question_id: string;
    answer: string;
  }[];

  evaluator: {
    result_type: string;
    evaluation_mode: string;
    scenario_name: string;
    total_questions: number;
    correct_answers: number;
    incorrect_answers: number;
    unanswered: number;
    maximum_marks: number;
    score: number;
    percentage: number;
    question_results: QuestionResult[];
  };
};

export default function SubmissionAuditPage() {
  const params = useParams();

  const submissionId = params?.submissionId;

  const [submission, setSubmission] =
    useState<SubmissionAudit | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!submissionId) return;

    async function loadAudit() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/submissions/${submissionId}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              "Unable to load submission audit."
          );
        }

        setSubmission(data.submission);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load submission audit."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAudit();
  }, [submissionId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">
          Loading submission audit...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-red-950 border border-red-700 rounded-xl p-6">
          <h1 className="text-xl font-bold text-red-300 mb-2">
            Audit Error
          </h1>

          <p className="text-red-200">
            {error}
          </p>

          <a
            href="/admin/dashboard"
            className="inline-block mt-5 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </a>
        </div>
      </main>
    );
  }

  if (!submission) {
    return null;
  }

  const evaluatorMatchesStored =
    submission.stored_score ===
      submission.evaluator.score &&
    submission.stored_maximum_marks ===
      submission.evaluator.maximum_marks &&
    Number(submission.stored_percentage) ===
      Number(submission.evaluator.percentage);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <header className="mb-8">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <p className="text-blue-400 font-semibold">
                SOC ALERT TRIAGE CONTEST
              </p>

              <h1 className="text-3xl md:text-4xl font-bold mt-2">
                Submission Audit #{submission.id}
              </h1>

              <p className="text-slate-400 mt-2">
                Evaluator-backed submission verification.
              </p>
            </div>

            <a
              href={`/admin/teams/${submission.team_id}`}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg"
            >
              ← Back to Team
            </a>

          </div>

        </header>

        {/* SUBMISSION INFORMATION */}

        <section className="grid md:grid-cols-3 gap-5 mb-8">

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            <p className="text-slate-400 text-sm">
              Team
            </p>

            <p className="text-2xl font-bold mt-1">
              {submission.team_id}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            <p className="text-slate-400 text-sm">
              Scenario
            </p>

            <p className="text-2xl font-bold mt-1">
              {submission.scenario_id}
            </p>

            <p className="text-slate-500 text-sm mt-1">
              {submission.evaluator.scenario_name}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            <p className="text-slate-400 text-sm">
              Submitted At
            </p>

            <p className="font-semibold mt-2">
              {new Date(
                submission.submitted_at
              ).toLocaleString()}
            </p>
          </div>

        </section>

        {/* SCORE AUDIT */}

        <section className="mb-8">

          <h2 className="text-2xl font-bold mb-5">
            Score Audit
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
              <p className="text-slate-400 text-sm">
                Stored Score
              </p>

              <p className="text-3xl font-bold mt-2">
                {submission.stored_score}
                <span className="text-lg text-slate-500">
                  {" "}
                  / {submission.stored_maximum_marks}
                </span>
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
              <p className="text-slate-400 text-sm">
                Evaluator Score
              </p>

              <p className="text-3xl font-bold mt-2">
                {submission.evaluator.score}
                <span className="text-lg text-slate-500">
                  {" "}
                  / {submission.evaluator.maximum_marks}
                </span>
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
              <p className="text-slate-400 text-sm">
                Stored Percentage
              </p>

              <p className="text-3xl font-bold mt-2">
                {Number(
                  submission.stored_percentage
                ).toFixed(2)}
                %
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
              <p className="text-slate-400 text-sm">
                Evaluator Percentage
              </p>

              <p className="text-3xl font-bold mt-2">
                {Number(
                  submission.evaluator.percentage
                ).toFixed(2)}
                %
              </p>
            </div>

          </div>

          <div
            className={`mt-5 rounded-xl border p-5 ${
              evaluatorMatchesStored
                ? "bg-green-950 border-green-700"
                : "bg-red-950 border-red-700"
            }`}
          >

            <p
              className={`font-bold ${
                evaluatorMatchesStored
                  ? "text-green-300"
                  : "text-red-300"
              }`}
            >
              {evaluatorMatchesStored
                ? "✓ STORED RESULT MATCHES EVALUATOR"
                : "✗ STORED RESULT DOES NOT MATCH EVALUATOR"}
            </p>

            {!evaluatorMatchesStored && (
              <p className="text-red-200 text-sm mt-2">
                The PostgreSQL result and the
                evaluator-backed result differ.
                Investigate this submission.
              </p>
            )}

          </div>

        </section>

        {/* EVALUATOR SUMMARY */}

        <section className="mb-8">

          <h2 className="text-2xl font-bold mb-5">
            Evaluator Summary
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
              <p className="text-slate-400 text-sm">
                Questions
              </p>

              <p className="text-2xl font-bold mt-2">
                {submission.evaluator.total_questions}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
              <p className="text-slate-400 text-sm">
                Correct
              </p>

              <p className="text-2xl font-bold text-green-400 mt-2">
                {submission.evaluator.correct_answers}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
              <p className="text-slate-400 text-sm">
                Incorrect
              </p>

              <p className="text-2xl font-bold text-red-400 mt-2">
                {submission.evaluator.incorrect_answers}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
              <p className="text-slate-400 text-sm">
                Unanswered
              </p>

              <p className="text-2xl font-bold mt-2">
                {submission.evaluator.unanswered}
              </p>
            </div>

          </div>

        </section>

        {/* QUESTION LEVEL AUDIT */}

        <section>

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-2xl font-bold">
                Question-Level Audit
              </h2>

              <p className="text-slate-400 mt-1">
                Stored student answers compared against
                the existing evaluator answer key.
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
                      Selected
                    </th>

                    <th className="px-5 py-4 text-center">
                      Correct Answer
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

                  {submission.evaluator.question_results.map(
                    (question) => (

                      <tr
                        key={question.question_id}
                        className="border-t border-slate-800"
                      >

                        <td className="px-5 py-4 font-semibold">
                          {question.question_id}
                        </td>

                        <td className="px-5 py-4 text-center">

                          <span className="inline-flex min-w-10 justify-center bg-slate-800 rounded-lg px-3 py-2 font-bold">
                            {question.selected_answer}
                          </span>

                        </td>

                        <td className="px-5 py-4 text-center">

                          <span className="inline-flex min-w-10 justify-center bg-slate-800 rounded-lg px-3 py-2 font-bold">
                            {question.correct_answer}
                          </span>

                        </td>

                        <td className="px-5 py-4 text-center">

                          {question.correct ? (

                            <span className="text-green-400 font-bold">
                              ✓ Correct
                            </span>

                          ) : (

                            <span className="text-red-400 font-bold">
                              ✗ Incorrect
                            </span>

                          )}

                        </td>

                        <td className="px-5 py-4 text-center font-bold">

                          {question.marks_awarded}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </section>

        {/* RAW ANSWERS */}

        <section className="mt-8">

          <details className="bg-slate-900 border border-slate-700 rounded-xl">

            <summary className="cursor-pointer p-5 font-semibold">
              View Stored Submission JSON
            </summary>

            <pre className="p-5 border-t border-slate-700 overflow-x-auto text-sm text-slate-300">
              {JSON.stringify(
                submission.answers,
                null,
                2
              )}
            </pre>

          </details>

        </section>

      </div>

    </main>
  );
}
