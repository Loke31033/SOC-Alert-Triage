import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        t.team_id,
        t.team_name,

        COALESCE(
          MAX(CASE
            WHEN s.scenario_id = 'scenario01'
            THEN s.score
          END), 0
        )::int AS scenario01_score,

        COALESCE(
          MAX(CASE
            WHEN s.scenario_id = 'scenario02'
            THEN s.score
          END), 0
        )::int AS scenario02_score,

        COALESCE(
          MAX(CASE
            WHEN s.scenario_id = 'scenario03'
            THEN s.score
          END), 0
        )::int AS scenario03_score,

        COALESCE(
          MAX(CASE
            WHEN s.scenario_id = 'scenario04'
            THEN s.score
          END), 0
        )::int AS scenario04_score,

        COALESCE(SUM(s.score), 0)::int AS total_score,

        COUNT(DISTINCT s.scenario_id)::int
          AS completed_scenarios

      FROM teams t

      LEFT JOIN submissions s
        ON t.team_id = s.team_id

      GROUP BY
        t.team_id,
        t.team_name

      ORDER BY
        COALESCE(SUM(s.score), 0) DESC,
        COUNT(DISTINCT s.scenario_id) DESC,
        t.team_id ASC
    `);

    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,

      team_id: row.team_id,
      team_name: row.team_name,

      scenario01_score: Number(row.scenario01_score),
      scenario02_score: Number(row.scenario02_score),
      scenario03_score: Number(row.scenario03_score),
      scenario04_score: Number(row.scenario04_score),

      total_score: Number(row.total_score),

      completed_scenarios:
        Number(row.completed_scenarios),
    }));

    return NextResponse.json({
      success: true,
      leaderboard,
    });

  } catch (error) {
    console.error("[LEADERBOARD ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load leaderboard.",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}
