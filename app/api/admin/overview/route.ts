import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [teamsResult, submissionsResult, recentResult] =
      await Promise.all([
        pool.query(`
          SELECT COUNT(*)::int AS count
          FROM teams
        `),

        pool.query(`
          SELECT
            COUNT(*)::int AS total_submissions,
            COUNT(DISTINCT team_id)::int AS teams_submitted,
            COUNT(DISTINCT team_id || ':' || scenario_id)::int
              AS completed_scenarios
          FROM submissions
        `),

        pool.query(`
          SELECT
            s.team_id,
            t.team_name,
            s.scenario_id,
            s.score,
            s.maximum_marks,
            s.percentage,
            s.submitted_at
          FROM submissions s
          LEFT JOIN teams t
            ON t.team_id = s.team_id
          ORDER BY s.submitted_at DESC
          LIMIT 20
        `),
      ]);

    const teams = teamsResult.rows[0];
    const submissions = submissionsResult.rows[0];

    return NextResponse.json({
      success: true,

      overview: {
        registered_teams: Number(teams.count),
        teams_submitted: Number(
          submissions.teams_submitted
        ),
        total_submissions: Number(
          submissions.total_submissions
        ),
        completed_scenarios: Number(
          submissions.completed_scenarios
        ),
        pending_scenarios:
          Math.max(
            Number(teams.count) * 4 -
              Number(submissions.completed_scenarios),
            0
          ),
      },

      recent_submissions: recentResult.rows.map(
        (row) => ({
          team_id: row.team_id,
          team_name: row.team_name,
          scenario_id: row.scenario_id,
          score: Number(row.score),
          maximum_marks: Number(
            row.maximum_marks
          ),
          percentage: Number(row.percentage),
          submitted_at: row.submitted_at,
        })
      ),
    });

  } catch (error) {
    console.error(
      "[ADMIN OVERVIEW ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load admin overview.",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}
