"use client";

import { useEffect, useState } from "react";

type Report = {
  id: number;
  team_id: string;
  username: string;
  message: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

export default function SupportReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  async function loadReports(nextFilter = filter) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/reports?status=${encodeURIComponent(nextFilter)}`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load support reports.");
      }

      const nextReports = Array.isArray(data?.reports) ? data.reports : [];
      setReports(nextReports);

      setDrafts((current) => {
        const next = { ...current };
        for (const report of nextReports) {
          if (!(report.id in next)) {
            next[report.id] = report.admin_reply ?? "";
          }
        }
        return next;
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load support reports."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports("ALL");
  }, []);

  async function updateReport(
    id: number,
    status?: Report["status"]
  ) {
    try {
      setSavingId(id);
      setError("");

      const response = await fetch("/api/admin/reports", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status,
          admin_reply: drafts[id] ?? "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update report.");
      }

      setReports((current) =>
        current.map((report) => (report.id === id ? data.report : report))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update report."
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support Reports</h1>
        <p className="mt-1 text-sm text-slate-400">
          Review student issues, reply, and resolve support requests.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setFilter(value);
              loadReports(value);
            }}
            className={`rounded-lg border px-3 py-2 text-xs font-medium ${
              filter === value
                ? "border-slate-500 bg-slate-800"
                : "border-slate-700"
            }`}
          >
            {value === "IN_PROGRESS"
              ? "In Progress"
              : value[0] + value.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">
          Loading support reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">
          No reports found.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <article
              key={report.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">
                    #{report.id} · Team {report.team_id}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Student: {report.username} ·{" "}
                    {new Date(report.created_at).toLocaleString()}
                  </div>
                </div>

                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">
                  {report.status === "IN_PROGRESS"
                    ? "In Progress"
                    : report.status === "RESOLVED"
                      ? "Resolved"
                      : "Open"}
                </span>
              </div>

              <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Student Issue
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">
                  {report.message}
                </p>
              </div>

              <label
                htmlFor={`reply-${report.id}`}
                className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Admin Reply
              </label>

              <textarea
                id={`reply-${report.id}`}
                rows={4}
                maxLength={5000}
                value={drafts[report.id] ?? ""}
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [report.id]: event.target.value,
                  }))
                }
                placeholder="Write the response for the student..."
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm outline-none"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={savingId === report.id}
                  onClick={() => updateReport(report.id, "IN_PROGRESS")}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs"
                >
                  Mark In Progress
                </button>

                <button
                  type="button"
                  disabled={savingId === report.id}
                  onClick={() => updateReport(report.id, "OPEN")}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs"
                >
                  Reopen
                </button>

                <button
                  type="button"
                  disabled={savingId === report.id}
                  onClick={() => updateReport(report.id, "RESOLVED")}
                  className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-950"
                >
                  {savingId === report.id ? "Saving..." : "Reply & Resolve"}
                </button>

                <button
                  type="button"
                  disabled={savingId === report.id}
                  onClick={() => updateReport(report.id)}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs"
                >
                  Save Reply
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
