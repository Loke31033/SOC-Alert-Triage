"use client";

import { FormEvent, useState } from "react";
import styles from "./Login.module.css";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/student/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error || "Unable to authenticate student."
        );
      }

      sessionStorage.setItem(
        "student_username",
        data.username
      );

      sessionStorage.setItem(
        "student_team_id",
        data.team_id
      );

      sessionStorage.setItem(
        "student_team_name",
        data.team_name || ""
      );

      window.location.href = "/student";
    } catch (err) {
      console.error("[STUDENT LOGIN ERROR]", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to login."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGrid} />

      <div className={styles.shell}>
        <header className={styles.topBar}>
          <div className={styles.brand}>
            <div className={styles.brandMark}>SOC</div>

            <div className={styles.brandText}>
              <span className={styles.brandTitle}>
                SOC Alert Triage Contest
              </span>

              <span className={styles.brandSubtitle}>
                Security Operations Center Investigation Platform
              </span>
            </div>
          </div>

          <div className={styles.status}>
            <span className={styles.statusDot} />
            System Online
          </div>
        </header>

        <div className={styles.layout}>
          <section className={styles.sidePanel}>
            <p className={styles.sideHeading}>
              Contest Environment
            </p>

            <h2 className={styles.sideTitle}>
              SOC Investigation
            </h2>

            <div className={styles.featureList}>
              <div className={styles.feature}>
                <span className={styles.featureIcon} />
                <span className={styles.featureText}>
                  Investigate assigned security incidents using
                  your isolated contest environment.
                </span>
              </div>

              <div className={styles.feature}>
                <span className={styles.featureIcon} />
                <span className={styles.featureText}>
                  Analyze alerts, correlate evidence and submit
                  investigation answers.
                </span>
              </div>

              <div className={styles.feature}>
                <span className={styles.featureIcon} />
                <span className={styles.featureText}>
                  Results and scoring are tracked for your team.
                </span>
              </div>
            </div>
          </section>

          <section className={styles.loginCard}>
            <div className={styles.logoSection}>
              <div className={styles.logo}>SOC</div>

              <h1 className={styles.title}>
                Student Authentication
              </h1>

              <p className={styles.description}>
                Authenticate to access the secure SOC investigation
                environment.
              </p>
            </div>

            <form
              className={styles.form}
              onSubmit={handleLogin}
            >
              <label
                className={styles.label}
                htmlFor="username"
              >
                Student Username
              </label>

              <input
                className={styles.input}
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                autoComplete="username"
                disabled={loading}
              />

              <label
                className={styles.label}
                htmlFor="password"
              >
                Password
              </label>

              <input
                className={styles.input}
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                disabled={loading}
              />

              {error && (
                <p
                  className={styles.error}
                  role="alert"
                >
                  {error}
                </p>
              )}

              <button
                className={styles.button}
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Authenticating..."
                  : "Authenticate"}
              </button>
            </form>

            <div className={styles.notice}>
              <p className={styles.noticeTitle}>
                Access Notice
              </p>

              <p className={styles.noticeText}>
                Use only the credentials issued for your team.
                Do not share authentication credentials with
                another participant.
              </p>
            </div>

            <div className={styles.footer}>
              <span>Secure Session</span>
              <span>•</span>
              <span>Live Scoring</span>
              <span>•</span>
              <span>Incident Investigation</span>
            </div>
          </section>

          <section className={styles.sidePanel}>
            <p className={styles.sideHeading}>
              Access Control
            </p>

            <h2 className={styles.sideTitle}>
              Authorized Students
            </h2>

            <div className={styles.featureList}>
              <div className={styles.feature}>
                <span className={styles.featureIcon} />
                <span className={styles.featureText}>
                  Student credentials are validated by the
                  contest authentication service.
                </span>
              </div>

              <div className={styles.feature}>
                <span className={styles.featureIcon} />
                <span className={styles.featureText}>
                  Your team identity is loaded after successful
                  authentication.
                </span>
              </div>

              <div className={styles.feature}>
                <span className={styles.featureIcon} />
                <span className={styles.featureText}>
                  Unauthorized access attempts are rejected.
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
