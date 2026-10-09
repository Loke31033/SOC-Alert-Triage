"use client";

import "./messages-ui.css";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type Report = {
  id: number;
  team_id: string;
  username: string;
  message: string;
  status:
    | "OPEN"
    | "IN_PROGRESS"
    | "RESOLVED";
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

function statusLabel(
  status: Report["status"]
) {
  if (status === "IN_PROGRESS") {
    return "IN PROGRESS";
  }

  if (status === "RESOLVED") {
    return "RESOLVED";
  }

  return "OPEN";
}

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default function StudentMessagesPage() {
  const [message, setMessage] =
    useState("");

  const [reports, setReports] =
    useState<Report[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [sent, setSent] =
    useState(false);

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/student/reports",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load support requests."
        );
      }

      setReports(
        Array.isArray(data?.reports)
          ? data.reports
          : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load support requests."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function submitMessage(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmed =
      message.trim();

    if (!trimmed) {
      setError(
        "Please describe the issue."
      );
      return;
    }

    try {
      setSending(true);
      setError("");
      setSent(false);

      const response = await fetch(
        "/api/student/reports",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            message: trimmed,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to send support request."
        );
      }

      setMessage("");
      setSent(true);

      await loadReports();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send support request."
      );
    } finally {
      setSending(false);
    }
  }

  const openCount = useMemo(
    () =>
      reports.filter(
        (report) =>
          report.status === "OPEN"
      ).length,
    [reports]
  );

  const inProgressCount = useMemo(
    () =>
      reports.filter(
        (report) =>
          report.status ===
          "IN_PROGRESS"
      ).length,
    [reports]
  );

  const resolvedCount = useMemo(
    () =>
      reports.filter(
        (report) =>
          report.status === "RESOLVED"
      ).length,
    [reports]
  );

  return (
    <main className="messages-console">

      <div className="messages-wrapper">

        {/* TOP BAR */}

        <header className="messages-topbar">

          <div>

            <div className="messages-brand">
              SOC ALERT TRIAGE CONTEST
            </div>

            <div className="messages-subtitle">
              SECURITY OPERATIONS CENTER
              <span>/</span>
              SUPPORT CHANNEL
            </div>

          </div>

          <div className="support-status">

            <span className="support-dot" />

            SUPPORT ONLINE

          </div>

        </header>

        {/* HEADER */}

        <section className="messages-header">

          <div>

            <div className="messages-kicker">
              COMMUNICATIONS
            </div>

            <h1>
              Messages
            </h1>

            <p>
              Contact the contest operations
              team for technical issues,
              investigation questions or
              contest support.
            </p>

          </div>

        </section>

        {/* METRICS */}

        <section className="message-metrics">

          <article className="message-metric">

            <span>
              TOTAL REQUESTS
            </span>

            <strong>
              {reports.length}
            </strong>

            <small>
              Submitted support requests
            </small>

          </article>

          <article className="message-metric">

            <span>
              OPEN
            </span>

            <strong>
              {openCount}
            </strong>

            <small>
              Awaiting operations review
            </small>

          </article>

          <article className="message-metric">

            <span>
              IN PROGRESS
            </span>

            <strong>
              {inProgressCount}
            </strong>

            <small>
              Currently being handled
            </small>

          </article>

          <article className="message-metric">

            <span>
              RESOLVED
            </span>

            <strong>
              {resolvedCount}
            </strong>

            <small>
              Closed support requests
            </small>

          </article>

        </section>

        {/* NEW MESSAGE */}

        <section className="compose-section">

          <div className="section-heading">

            <div>

              <span>
                SUPPORT CHANNEL
              </span>

              <h2>
                Open a Support Request
              </h2>

            </div>

            <span className="channel-indicator">
              SECURE
            </span>

          </div>

          <form
            onSubmit={submitMessage}
            className="message-form"
          >

            <label>
              INCIDENT / SUPPORT DESCRIPTION
            </label>

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }
              placeholder={
                "Describe the issue clearly...\n\nExample: Kibana is not loading the assigned scenario dataset."
              }
              rows={7}
              disabled={sending}
            />

            <div className="compose-footer">

              <div className="compose-hint">
                Do not include passwords or
                sensitive credentials.
              </div>

              <button
                type="submit"
                disabled={
                  sending ||
                  !message.trim()
                }
              >
                {sending
                  ? "TRANSMITTING..."
                  : "SEND REQUEST"}
              </button>

            </div>

          </form>

          {sent && (

            <div className="success-banner">
              <span>✓</span>

              Support request submitted
              successfully. Operations has
              received your message.

            </div>

          )}

          {error && (

            <div className="error-banner">
              <strong>
                COMMUNICATION ERROR
              </strong>

              <span>
                {error}
              </span>
            </div>

          )}

        </section>

        {/* REQUEST HISTORY */}

        <section className="history-section">

          <div className="section-heading">

            <div>

              <span>
                CASE HISTORY
              </span>

              <h2>
                Support Requests
              </h2>

            </div>

            <button
              type="button"
              className="refresh-button"
              onClick={loadReports}
              disabled={loading}
            >
              {loading
                ? "LOADING..."
                : "REFRESH"}
            </button>

          </div>

          {loading ? (

            <div className="messages-loading">

              <div className="messages-spinner" />

              LOADING SUPPORT CASES...

            </div>

          ) : reports.length === 0 ? (

            <div className="empty-messages">

              <div className="empty-icon">
                —
              </div>

              <strong>
                No support requests
              </strong>

              <span>
                Your submitted requests will
                appear here.
              </span>

            </div>

          ) : (

            <div className="request-list">

              {reports.map((report) => (

                <article
                  key={report.id}
                  className="request-card"
                >

                  <div className="request-card-top">

                    <div>

                      <span className="case-id">
                        CASE #
                        {String(
                          report.id
                        ).padStart(4, "0")}
                      </span>

                      <span className="case-date">
                        {formatDate(
                          report.created_at
                        )}
                      </span>

                    </div>

                    <span
                      className={`request-status ${
                        report.status
                          .toLowerCase()
                          .replace(
                            "_",
                            "-"
                          )
                      }`}
                    >
                      <i />
                      {statusLabel(
                        report.status
                      )}
                    </span>

                  </div>

                  <div className="request-message">

                    <div className="message-label">
                      YOUR REQUEST
                    </div>

                    <p>
                      {report.message}
                    </p>

                  </div>

                  {report.admin_reply && (

                    <div className="admin-response">

                      <div className="response-header">

                        <span>
                          OPERATIONS RESPONSE
                        </span>

                        <small>
                          {formatDate(
                            report.updated_at
                          )}
                        </small>

                      </div>

                      <p>
                        {report.admin_reply}
                      </p>

                    </div>

                  )}

                  {!report.admin_reply && (
                    <div className="waiting-response">

                      <span className="waiting-dot" />

                      Awaiting operations
                      response

                    </div>
                  )}

                  <div className="request-footer">

                    <span>
                      STATUS:{" "}
                      {statusLabel(
                        report.status
                      )}
                    </span>

                    {report.resolved_at && (
                      <span>
                        RESOLVED:{" "}
                        {formatDate(
                          report.resolved_at
                        )}
                      </span>
                    )}

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

        {/* FOOTER */}

        <footer className="messages-footer">

          <span>
            SOC ALERT TRIAGE CONTEST
          </span>

          <span>
            SUPPORT CHANNEL ONLINE
          </span>

          <span>
            OPERATIONS COMMUNICATIONS
          </span>

        </footer>

      </div>

    </main>
  );
}
