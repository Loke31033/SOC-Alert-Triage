import fs from "fs";
import pg from "pg";

const { Pool } = pg;

const envText = fs.readFileSync(
  process.env.HOME + "/SOC-DATA-GENERATOR/web/frontend/.env.local",
  "utf8"
);

const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}

const pool = new Pool({
  host: env.POSTGRES_HOST,
  port: Number(env.POSTGRES_PORT || 5432),
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
});

const client = await pool.connect();

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS contest_teams (
      id SERIAL PRIMARY KEY,
      team_id VARCHAR(64) UNIQUE NOT NULL,
      team_name VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS contest_students (
      id SERIAL PRIMARY KEY,
      team_id VARCHAR(64) NOT NULL REFERENCES contest_teams(team_id)
        ON DELETE CASCADE,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const team = await client.query(
    `SELECT team_id, team_name FROM contest_teams
     WHERE team_id = 'TEST01'`
  );

  const students = await client.query(
    `SELECT username, team_id, password_hash
     FROM contest_students
     WHERE team_id = 'TEST01'
     ORDER BY username`
  );

  console.log("[TEAM]", JSON.stringify(team.rows));
  console.log("[STUDENTS]", students.rows.length);

  if (students.rows.length !== 6) {
    throw new Error("Controlled team does not contain exactly 6 students");
  }

  if (students.rows.some((r) => r.team_id !== "TEST01")) {
    throw new Error("Student/team binding failed");
  }

  if (students.rows.some((r) => !r.password_hash || r.password_hash.length < 30)) {
    throw new Error("Password hash validation failed");
  }

  console.log("[PASS] TEST01 exists");
  console.log("[PASS] Exactly 6 students exist");
  console.log("[PASS] All students are bound to TEST01");
  console.log("[PASS] Passwords are stored as hashes");
} finally {
  client.release();
  await pool.end();
}
