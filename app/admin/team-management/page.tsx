"use client";

import { FormEvent, useEffect, useState } from "react";

type Team = {
  team_id: string;
  team_name: string | null;
};

type Student = {
  username: string;
  team_id: string;
};

type Data = {
  teams: Team[];
  students: Student[];
};

export default function AdminTeamManagementPage() {

  const [data, setData] = useState<Data>({
    teams: [],
    students: [],
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [teamId, setTeamId] = useState("");
  const [teamName, setTeamName] = useState("");

  const [editTeamId, setEditTeamId] = useState("");
  const [editTeamName, setEditTeamName] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [studentTeam, setStudentTeam] = useState("");

  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editStudentTeam, setEditStudentTeam] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/management",
        {
          cache: "no-store",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
          "Unable to load management data."
        );
      }

      setData({
        teams: result.teams || [],
        students: result.students || [],
      });

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load management data."
      );

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function send(
    method: string,
    body: Record<string, string>
  ) {

    setMessage("");
    setError("");

    const response = await fetch(
      "/api/admin/management",
      {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error ||
        "Operation failed."
      );
    }

    return result;
  }

  async function addTeam(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {

      await send("POST", {
        action: "create_team",
        team_id: teamId,
        team_name: teamName,
      });

      setTeamId("");
      setTeamName("");

      setMessage("Team created successfully.");

      await loadData();

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create team."
      );
    }
  }

  async function editTeam(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {

      await send("PATCH", {
        action: "edit_team",
        team_id: editTeamId,
        team_name: editTeamName,
      });

      setMessage("Team updated successfully.");

      await loadData();

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update team."
      );
    }
  }

  async function addStudent(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {

      await send("POST", {
        action: "create_student",
        username,
        password,
        team_id: studentTeam,
      });

      setUsername("");
      setPassword("");
      setStudentTeam("");

      setMessage("Student created successfully.");

      await loadData();

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create student."
      );
    }
  }

  async function editStudent(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {

      await send("PATCH", {
        action: "edit_student",
        username: editUsername,
        password: editPassword,
        team_id: editStudentTeam,
      });

      setEditPassword("");

      setMessage("Student updated successfully.");

      await loadData();

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update student."
      );
    }
  }

  async function deleteStudent(
    student: Student
  ) {

    const confirmed = window.confirm(
      `Delete student ${student.username}?\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {

      await send("DELETE", {
        action: "delete_student",
        username: student.username,
      });

      setMessage(
        `Student ${student.username} deleted.`
      );

      await loadData();

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete student."
      );
    }
  }

  function selectStudent(student: Student) {
    setEditUsername(student.username);
    setEditStudentTeam(student.team_id);
    setEditPassword("");
  }

  return (
    <main className="admin-management-page">

      <header className="admin-management-header">
        <div>
          <span className="eyebrow">
            ADMINISTRATION
          </span>

          <h1>
            Team & Student Management
          </h1>

          <p>
            Manage contest teams and student accounts.
          </p>
        </div>

        <a href="/admin/teams">
          Back to Teams
        </a>
      </header>

      {message && (
        <div className="admin-management-success">
          {message}
        </div>
      )}

      {error && (
        <div className="admin-management-error">
          {error}
        </div>
      )}

      <section className="admin-management-grid">

        <div className="admin-management-card">

          <h2>Add Team</h2>

          <form onSubmit={addTeam}>

            <label>
              Team ID
            </label>

            <input
              value={teamId}
              onChange={(e) =>
                setTeamId(
                  e.target.value.toUpperCase()
                )
              }
              placeholder="TEAM04"
              required
            />

            <label>
              Team Name
            </label>

            <input
              value={teamName}
              onChange={(e) =>
                setTeamName(e.target.value)
              }
              placeholder="Blue Team"
              required
            />

            <button type="submit">
              ADD TEAM
            </button>

          </form>
        </div>

        <div className="admin-management-card">

          <h2>Edit Team</h2>

          <form onSubmit={editTeam}>

            <label>
              Existing Team
            </label>

            <select
              value={editTeamId}
              onChange={(e) => {
                const id = e.target.value;
                setEditTeamId(id);

                const selected =
                  data.teams.find(
                    (team) =>
                      team.team_id === id
                  );

                setEditTeamName(
                  selected?.team_name || ""
                );
              }}
              required
            >

              <option value="">
                Select team
              </option>

              {data.teams.map((team) => (
                <option
                  key={team.team_id}
                  value={team.team_id}
                >
                  {team.team_id}
                </option>
              ))}

            </select>

            <label>
              Team Name
            </label>

            <input
              value={editTeamName}
              onChange={(e) =>
                setEditTeamName(e.target.value)
              }
              required
            />

            <button type="submit">
              SAVE TEAM
            </button>

          </form>
        </div>

        <div className="admin-management-card">

          <h2>Add Student</h2>

          <form onSubmit={addStudent}>

            <label>
              Username
            </label>

            <input
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
            />

            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <label>
              Team
            </label>

            <select
              value={studentTeam}
              onChange={(e) =>
                setStudentTeam(e.target.value)
              }
              required
            >

              <option value="">
                Select team
              </option>

              {data.teams.map((team) => (
                <option
                  key={team.team_id}
                  value={team.team_id}
                >
                  {team.team_id} —{" "}
                  {team.team_name}
                </option>
              ))}

            </select>

            <button type="submit">
              ADD STUDENT
            </button>

          </form>
        </div>

        <div className="admin-management-card">

          <h2>Edit Student</h2>

          <form onSubmit={editStudent}>

            <label>
              Username
            </label>

            <input
              value={editUsername}
              onChange={(e) =>
                setEditUsername(e.target.value)
              }
              required
            />

            <label>
              New Password
            </label>

            <input
              type="password"
              value={editPassword}
              onChange={(e) =>
                setEditPassword(e.target.value)
              }
              placeholder="Leave empty to keep password"
            />

            <label>
              Team
            </label>

            <select
              value={editStudentTeam}
              onChange={(e) =>
                setEditStudentTeam(e.target.value)
              }
              required
            >

              <option value="">
                Select team
              </option>

              {data.teams.map((team) => (
                <option
                  key={team.team_id}
                  value={team.team_id}
                >
                  {team.team_id}
                </option>
              ))}

            </select>

            <button type="submit">
              SAVE STUDENT
            </button>

          </form>
        </div>

      </section>

      <section className="admin-management-card">

        <h2>
          Registered Students
        </h2>

        {loading ? (
          <p>Loading students...</p>
        ) : (
          <div className="admin-management-table-wrap">

            <table className="admin-management-table">

              <thead>
                <tr>
                  <th>USERNAME</th>
                  <th>TEAM</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>

                {data.students.map(
                  (student) => (
                    <tr key={student.username}>

                      <td>
                        {student.username}
                      </td>

                      <td>
                        {student.team_id}
                      </td>

                      <td>

                        <button
                          type="button"
                          onClick={() =>
                            selectStudent(student)
                          }
                        >
                          EDIT
                        </button>

                        <button
                          type="button"
                          className="danger"
                          onClick={() =>
                            deleteStudent(student)
                          }
                        >
                          DELETE
                        </button>

                      </td>

                    </tr>
                  )
                )}

                {!data.students.length && (
                  <tr>
                    <td
                      colSpan={3}
                    >
                      No students found.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

    </main>
  );
}
