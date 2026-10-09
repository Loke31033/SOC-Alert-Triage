
type AnswerReviewItem = {
  question_id: string;
  question: string;
  student_answer?: string | null;
  correct_answer?: string | null;
  is_correct: boolean;
  marks_awarded?: number;
  maximum_marks?: number;
  explanation?: string | null;
};

export default function AnswerReview({
  items,
}: {
  items: AnswerReviewItem[];
}) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm text-slate-500">
          No question-level review is available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <article
          key={item.question_id}
          className={[
            "rounded-2xl border p-5",
            item.is_correct
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-red-500/20 bg-red-500/5",
          ].join(" ")}
        >

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Question {index + 1}
              </p>

              <h3 className="mt-2 font-semibold leading-6 text-white">
                {item.question}
              </h3>
            </div>

            <span
              className={[
                "shrink-0 rounded-md border px-2.5 py-1 text-xs font-bold",
                item.is_correct
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400",
              ].join(" ")}
            >
              {item.is_correct
                ? "CORRECT"
                : "INCORRECT"}
            </span>

          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Your Answer
              </p>

              <p className="mt-2 text-sm text-slate-200">
                {item.student_answer || "Not answered"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Correct Answer
              </p>

              <p className="mt-2 text-sm text-slate-200">
                {item.correct_answer || "Not available"}
              </p>
            </div>

          </div>

          <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Explanation
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {item.explanation ||
                "Explanation is not available for this question yet."}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Marks awarded
            </span>

            <span className="font-semibold text-slate-300">
              {item.marks_awarded ?? 0}
              {item.maximum_marks != null
                ? ` / ${item.maximum_marks}`
                : ""}
            </span>
          </div>

        </article>
      ))}
    </div>
  );
}
