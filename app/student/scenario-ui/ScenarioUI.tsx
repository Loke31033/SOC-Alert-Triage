
import React from "react";

type ScenarioHeaderProps = {
  scenarioId: string;
  scenarioName: string;
  teamId: string;
  totalQuestions?: number;
  answered?: number;
  submitted?: boolean;
};

export function ScenarioHeader({
  scenarioId,
  scenarioName,
  teamId,
  totalQuestions = 0,
  answered = 0,
  submitted = false,
}: ScenarioHeaderProps) {
  const progress =
    totalQuestions > 0
      ? Math.round((answered / totalQuestions) * 100)
      : 0;

  return (
    <header className="mb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              {scenarioId}
            </span>

            <span
              className={[
                "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold",
                submitted
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-400",
              ].join(" ")}
            >
              {submitted ? "SUBMITTED" : "INVESTIGATION ACTIVE"}
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            {scenarioName}
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Team{" "}
            <span className="font-semibold text-slate-200">
              {teamId}
            </span>
          </p>
        </div>

        <div className="min-w-[240px] rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Investigation Progress
            </span>

            <span className="font-semibold text-cyan-400">
              {progress}%
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-500">
            {answered} / {totalQuestions} questions answered
          </p>
        </div>

      </div>
    </header>
  );
}

export function InvestigationCard({
  children,
  title,
  eyebrow,
}: {
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/20">

      <div className="border-b border-slate-800 px-5 py-4">
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-400">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-1 text-lg font-semibold text-white">
          {title}
        </h2>
      </div>

      <div className="p-5">
        {children}
      </div>

    </section>
  );
}

export function KibanaLaunchCard({
  onLaunch,
  loading = false,
}: {
  onLaunch: () => void;
  loading?: boolean;
}) {
  return (
    <InvestigationCard
      eyebrow="Security Operations"
      title="Investigation Console"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="font-medium text-slate-200">
            Analyze the assigned security telemetry
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-400">
            Open the team-specific Kibana dashboard and investigate
            the alerts, authentication activity, network events and
            other evidence before answering the questions.
          </p>
        </div>

        <button
          type="button"
          onClick={onLaunch}
          disabled={loading}
          className="shrink-0 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Opening..." : "Open Kibana"}
        </button>

      </div>
    </InvestigationCard>
  );
}

export function SubmissionBanner({
  submitted,
  submitting,
}: {
  submitted: boolean;
  submitting: boolean;
}) {
  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <p className="font-semibold text-emerald-300">
          Submission completed
        </p>

        <p className="mt-1 text-sm text-emerald-400/80">
          Your answers have been evaluated. Continue to the Results
          page to review your performance.
        </p>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
        <p className="font-semibold text-cyan-300">
          Evaluating submission...
        </p>

        <p className="mt-1 text-sm text-cyan-400/80">
          Please do not close the page.
        </p>
      </div>
    );
  }

  return null;
}
