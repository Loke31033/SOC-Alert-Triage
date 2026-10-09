"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Authentication failed."
        );
      }

      router.push("/admin/dashboard");
      router.refresh();

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Authentication failed."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">

      <div className="w-full max-w-md">

        <div className="text-center mb-8">

          <p className="text-blue-400 font-semibold">
            SOC ALERT TRIAGE CONTEST
          </p>

          <h1 className="text-4xl font-bold mt-3">
            Admin Portal
          </h1>

          <p className="text-slate-400 mt-3">
            Secure administrator authentication
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-xl"
        >

          <div className="mb-5">

            <label
              htmlFor="username"
              className="block text-sm font-semibold mb-2"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
              autoComplete="username"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>

          <div className="mb-6">

            <label
              htmlFor="password"
              className="block text-sm font-semibold mb-2"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              autoComplete="current-password"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>

          {error && (
            <div className="bg-red-950 border border-red-800 text-red-300 rounded-lg p-3 mb-5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 px-4 py-3 rounded-lg font-semibold"
          >
            {loading
              ? "Authenticating..."
              : "Admin Sign In"}
          </button>

        </form>

      </div>

    </main>
  );
}
