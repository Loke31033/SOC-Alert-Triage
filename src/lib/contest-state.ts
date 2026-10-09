import pool from "@/lib/db";

export type ContestStatus = "OPEN" | "CLOSED";

export async function getContestState() {
  const result = await pool.query(`
    SELECT
      status,
      started_at,
      ended_at,
      updated_at
    FROM contest_state
    WHERE id = 1
    LIMIT 1
  `);

  if (result.rows.length === 0) {
    throw new Error("Contest state is not initialized.");
  }

  const row = result.rows[0];

  return {
    status: row.status as ContestStatus,
    started_at: row.started_at,
    ended_at: row.ended_at,
    updated_at: row.updated_at,
  };
}

export async function isContestOpen() {
  const state = await getContestState();
  return state.status === "OPEN";
}

export async function getScenarioState(scenarioId: string) {
  const result = await pool.query(
    `
    SELECT
      scenario_id,
      enabled,
      updated_at
    FROM scenario_state
    WHERE scenario_id = $1
    LIMIT 1
    `,
    [scenarioId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function isScenarioEnabled(
  scenarioId: string
) {
  const scenario = await getScenarioState(scenarioId);

  return Boolean(scenario?.enabled);
}
