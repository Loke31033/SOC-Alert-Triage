"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import "../styles/scenario-console-v2.css";

type Question = {
    question_id: string;
    question_type: string;
    question: string;
    options: Record<string, string>;
    marks: number;
};

type QuestionPackage = {
    package_type: string;
    team_id: string;
    scenario_id: string;
    scenario_name: string;
    total_questions: number;
    total_marks: number;
    questions: Question[];
};

type EvaluationResult = {
    score: number;
    total_marks: number;
    percentage: number;
};

const SCENARIO_ID = "scenario04";

export default function ScenarioPage() {

    const [data, setData] =
        useState<QuestionPackage | null>(null);

    const [answers, setAnswers] =
        useState<Record<string, string>>({});

    const [currentIndex, setCurrentIndex] =
        useState(0);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [submitted, setSubmitted] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);

    const [result, setResult] =
        useState<EvaluationResult | null>(null);

    useEffect(() => {

        async function loadQuestions() {

            try {

                const response = await fetch(
                    `/api/student/${SCENARIO_ID}`,
                    {
                        cache: "no-store",
                        credentials: "include",
                    }
                );

                const json =
                    await response.json().catch(() => ({}));

                if (!response.ok) {

                    const message =
                        typeof json?.error === "string"
                            ? json.error
                            : "Unable to load scenario questions.";

                    throw new Error(message);
                }

                setData(json as QuestionPackage);

            } catch (err) {

                console.error(err);

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load scenario."
                );

            } finally {

                setLoading(false);

            }
        }

        loadQuestions();

    }, []);

    function handleAnswer(
        questionId: string,
        option: string
    ) {

        if (submitted) {
            return;
        }

        setAnswers((previous) => ({
            ...previous,
            [questionId]: option,
        }));
    }

    async function handleSubmit() {

        if (!data || submitting || submitted) {
            return;
        }

        const answeredCount =
            Object.keys(answers).length;

        if (answeredCount !== data.total_questions) {

            alert(
                `Please answer all ${data.total_questions} questions before submitting.`
            );

            return;
        }

        setSubmitting(true);
        setError("");

        try {

            const submission = {
                submission_type:
                    "student_mcq_submission",

                submission_mode:
                    "web",

                team_id:
                    data.team_id,

                scenario_id:
                    data.scenario_id,

                answers:
                    data.questions.map((question) => ({
                        question_id:
                            question.question_id,

                        answer:
                            answers[question.question_id],
                    })),
            };

            const response =
                await fetch(
                    "/api/student/submit",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify(submission),
                    }
                );

            const evaluation =
                await response.json();

            if (
                !response.ok ||
                !evaluation.success
            ) {

                throw new Error(
                    evaluation.error ||
                    "Submission evaluation failed."
                );
            }

            setResult({
                score:
                    evaluation.score,

                total_marks:
                    evaluation.total_marks,

                percentage:
                    evaluation.percentage,
            });

            setSubmitted(true);

        } catch (err) {

            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Submission failed."
            );

        } finally {

            setSubmitting(false);

        }
    }

    const answeredCount =
        Object.keys(answers).length;

    const progress =
        data && data.total_questions > 0
            ? Math.round(
                (answeredCount /
                    data.total_questions) *
                100
            )
            : 0;

    const currentQuestion =
        data?.questions[currentIndex] || null;

    const currentAnswer =
        currentQuestion
            ? answers[currentQuestion.question_id]
            : undefined;

    if (loading) {

        return (
            <main className="sc-v2">

                <div className="sc-v2-container">

                    <section className="sc-v2-header">

                        <div className="sc-v2-eyebrow">
                            SOC INVESTIGATION CONSOLE
                        </div>

                        <h1 className="sc-v2-title">
                            Loading Investigation
                        </h1>

                        <p className="sc-v2-description">
                            Loading the assigned scenario package...
                        </p>

                    </section>

                </div>

            </main>
        );
    }

    if (error && !data) {

        return (
            <main className="sc-v2">

                <div className="sc-v2-container">

                    <section className="sc-v2-header">

                        <div className="sc-v2-eyebrow">
                            SCENARIO ACCESS ERROR
                        </div>

                        <h1 className="sc-v2-title">
                            Scenario Unavailable
                        </h1>

                        <div className="sc-v2-error">
                            {error}
                        </div>

                        <div className="sc-v2-actions">

                            <Link
                                href="/student/dashboard"
                                className="sc-v2-button sc-v2-primary"
                            >
                                RETURN TO DASHBOARD
                            </Link>

                            <Link
                                href="/student/messages"
                                className="sc-v2-button"
                            >
                                CONTACT SUPPORT
                            </Link>

                        </div>

                    </section>

                </div>

            </main>
        );
    }

    if (!data) {
        return null;
    }

    if (submitted && result) {

        return (
            <main className="sc-v2">

                <div className="sc-v2-container">

                    <section className="sc-v2-result">

                        <div className="sc-v2-result-icon">
                            ✓
                        </div>

                        <div className="sc-v2-result-title">
                            Investigation Submitted
                        </div>

                        <div className="sc-v2-score">
                            {result.score}
                            <span
                                style={{
                                    fontSize: "1rem",
                                    color: "#64748b"
                                }}
                            >
                                {" "} / {result.total_marks}
                            </span>
                        </div>

                        <div className="sc-v2-result-sub">
                            Final Score · {result.percentage}%
                        </div>

                        <div
                            className="sc-v2-actions"
                            style={{
                                justifyContent: "center"
                            }}
                        >

                            <Link
                                href="/student/results"
                                className="sc-v2-button sc-v2-primary"
                            >
                                VIEW RESULTS
                            </Link>

                            <Link
                                href="/student/dashboard"
                                className="sc-v2-button"
                            >
                                DASHBOARD
                            </Link>

                        </div>

                    </section>

                </div>

            </main>
        );
    }

    return (
        <main className="sc-v2">

            <div className="sc-v2-container">

                <header className="sc-v2-topbar">

                    <div className="sc-v2-brand">

                        <div className="sc-v2-logo">
                            SOC
                        </div>

                        <div>

                            <div className="sc-v2-brand-title">
                                ALERT TRIAGE CONTEST
                            </div>

                            <div className="sc-v2-brand-subtitle">
                                SECURITY OPERATIONS CENTER
                            </div>

                        </div>

                    </div>

                    <div className="sc-v2-live">

                        <span className="sc-v2-live-dot" />

                        INVESTIGATION ACTIVE

                    </div>

                </header>

                <section className="sc-v2-header">

                    <div className="sc-v2-eyebrow">
                        SCENARIO {SCENARIO_ID.replace("scenario", "")}
                    </div>

                    <h1 className="sc-v2-title">
                        {data.scenario_name}
                    </h1>

                    <p className="sc-v2-description">
                        Analyze the assigned SOC evidence,
                        correlate indicators, and complete
                        the investigation questions.
                    </p>

                    <div className="sc-v2-actions">

                        <Link
                            href="/student/dashboard"
                            className="sc-v2-button"
                        >
                            ← DASHBOARD
                        </Link>

                        <Link
                            href="/student/messages"
                            className="sc-v2-button"
                        >
                            SUPPORT
                        </Link>

                    </div>

                </section>

                <section className="sc-v2-metrics">

                    <div className="sc-v2-metric">

                        <div className="sc-v2-label">
                            QUESTIONS
                        </div>

                        <div className="sc-v2-value">
                            {data.total_questions}
                        </div>

                    </div>

                    <div className="sc-v2-metric">

                        <div className="sc-v2-label">
                            ANSWERED
                        </div>

                        <div className="sc-v2-value sc-v2-cyan">
                            {answeredCount}
                        </div>

                    </div>

                    <div className="sc-v2-metric">

                        <div className="sc-v2-label">
                            PROGRESS
                        </div>

                        <div className="sc-v2-value">
                            {progress}%
                        </div>

                    </div>

                    <div className="sc-v2-metric">

                        <div className="sc-v2-label">
                            TOTAL MARKS
                        </div>

                        <div className="sc-v2-value sc-v2-green">
                            {data.total_marks}
                        </div>

                    </div>

                </section>

                <section className="sc-v2-workspace">

                    <aside className="sc-v2-sidebar">

                        <div className="sc-v2-sidebar-title">
                            INVESTIGATION MAP
                        </div>

                        <div className="sc-v2-sidebar-subtitle">
                            {answeredCount} / {data.total_questions} answered
                        </div>

                        <div className="sc-v2-progress">

                            <div
                                style={{
                                    width: `${progress}%`
                                }}
                            />

                        </div>

                        <div className="sc-v2-question-grid">

                            {data.questions.map(
                                (question, index) => {

                                    const answered =
                                        Boolean(
                                            answers[
                                                question.question_id
                                            ]
                                        );

                                    return (
                                        <button
                                            key={question.question_id}
                                            type="button"
                                            className={[
                                                "sc-v2-question-nav",
                                                answered
                                                    ? "answered"
                                                    : "",
                                                index === currentIndex
                                                    ? "active"
                                                    : ""
                                            ].join(" ")}
                                            onClick={() =>
                                                setCurrentIndex(index)
                                            }
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                }
                            )}

                        </div>

                    </aside>

                    <div>

                        {currentQuestion && (

                            <article className="sc-v2-question">

                                <div className="sc-v2-question-header">

                                    <div>

                                        <div className="sc-v2-question-number">
                                            QUESTION{" "}
                                            {String(
                                                currentIndex + 1
                                            ).padStart(2, "0")}
                                        </div>

                                        <div className="sc-v2-question-text">
                                            {currentQuestion.question}
                                        </div>

                                    </div>

                                    <div className="sc-v2-question-marks">
                                        {currentQuestion.marks} MARKS
                                    </div>

                                </div>

                                <div className="sc-v2-options">

                                    {Object.entries(
                                        currentQuestion.options
                                    ).map(
                                        ([letter, value]) => {

                                            const selected =
                                                currentAnswer === letter;

                                            return (
                                                <button
                                                    key={letter}
                                                    type="button"
                                                    disabled={submitted}
                                                    onClick={() =>
                                                        handleAnswer(
                                                            currentQuestion.question_id,
                                                            letter
                                                        )
                                                    }
                                                    className={[
                                                        "sc-v2-option",
                                                        selected
                                                            ? "selected"
                                                            : ""
                                                    ].join(" ")}
                                                >

                                                    <span className="sc-v2-letter">
                                                        {letter}
                                                    </span>

                                                    <span className="sc-v2-option-text">
                                                        {value}
                                                    </span>

                                                </button>
                                            );
                                        }
                                    )}

                                </div>

                                <div className="sc-v2-controls">

                                    <button
                                        type="button"
                                        className="sc-v2-button"
                                        disabled={
                                            currentIndex === 0
                                        }
                                        onClick={() =>
                                            setCurrentIndex(
                                                value =>
                                                    Math.max(
                                                        0,
                                                        value - 1
                                                    )
                                            )
                                        }
                                    >
                                        ← PREVIOUS
                                    </button>

                                    <button
                                        type="button"
                                        className="sc-v2-button sc-v2-primary"
                                        disabled={
                                            currentIndex ===
                                            data.questions.length - 1
                                        }
                                        onClick={() =>
                                            setCurrentIndex(
                                                value =>
                                                    Math.min(
                                                        data.questions.length - 1,
                                                        value + 1
                                                    )
                                            )
                                        }
                                    >
                                        NEXT →
                                    </button>

                                </div>

                            </article>

                        )}

                        
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              const storedTeamId =
                sessionStorage.getItem("student_team_id");

              const storedScenarioId =
                data?.scenario_id || "scenario04";

              if (!storedTeamId) {
                setError(
                  "Team session not found. Please log in again."
                );
                return;
              }

              const params = new URLSearchParams({
                team_id: storedTeamId,
                scenario_id: storedScenarioId,
              });

              fetch(
                `/api/student/kibana?${params.toString()}`,
                {
                  method: "GET",
                  cache: "no-store",
                }
              )
                .then(async (response) => {
                  const json = await response.json();

                  if (
                    !response.ok ||
                    !json.success ||
                    !json.kibana_url
                  ) {
                    throw new Error(
                      json.error ||
                      "Unable to open Kibana."
                    );
                  }

                  window.open(
                    json.kibana_url,
                    "_blank",
                    "noopener,noreferrer"
                  );
                })
                .catch((err) => {
                  setError(
                    err?.message ||
                    "Unable to open Kibana."
                  );
                });
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow hover:bg-blue-700"
          >
            Open Kibana
          </button>
        </div>
<section className="sc-v2-submit">

                            <div className="sc-v2-submit-row">

                                <div>

                                    <div className="sc-v2-submit-title">
                                        Submit Investigation
                                    </div>

                                    <div className="sc-v2-submit-info">
                                        {answeredCount} of{" "}
                                        {data.total_questions}
                                        {" "}questions answered
                                    </div>

                                </div>

                                <button
                                    type="button"
                                    className="sc-v2-submit-button"
                                    disabled={
                                        submitting ||
                                        submitted ||
                                        answeredCount !==
                                        data.total_questions
                                    }
                                    onClick={handleSubmit}
                                >
                                    {submitting
                                        ? "EVALUATING..."
                                        : answeredCount !==
                                          data.total_questions
                                        ? "COMPLETE ALL QUESTIONS"
                                        : "SUBMIT INVESTIGATION"}
                                </button>

                            </div>

                            {error && (
                                <div className="sc-v2-error">
                                    {error}
                                </div>
                            )}

                        </section>

                    </div>

                </section>

            </div>

        </main>
    );
}
