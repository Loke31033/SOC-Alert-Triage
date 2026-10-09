import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export const runtime = "nodejs";

function submissionTeamId(teamId: string): string {
  const normalized = teamId.trim();

  if (/^TEAM(0[1-9]|10)$/.test(normalized)) {
    return normalized.toLowerCase();
  }

  return normalized;
}

export const dynamic = "force-dynamic";

function validTeamId(value: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(value);
}

export async function GET(request: NextRequest) {
  try {
    const teamId =
      request.nextUrl.searchParams.get("team_id")?.trim() || "";

    if (!teamId) {
      return NextResponse.json(
        {
          success: false,
          error: "Student team identity is required.",
        },
        { status: 400 }
      );
    }

    if (!validTeamId(teamId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid team identity.",
        },
        { status: 400 }
      );
    }

    /*
     * Dashboard data is read-only.
     *
     * This endpoint does not modify:
     * - submissions
     * - answers
     * - scenarios
     * - contest state
     * - Kibana configuration
     */

    const teamResult = await pool.query(
      `
      SELECT
        team_id,
        team_name
      FROM teams
      WHERE team_id = $1

      UNION ALL

      SELECT
        team_id,
        team_name
      FROM contest_teams
      WHERE team_id = $1

      LIMIT 1
      `,
      [teamId]
    );

    if (teamResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Student team not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Read submitted scenario results.
     *
     * The query intentionally uses the existing submissions
     * structure only when those tables/columns exist.
     */

    let results: any[] = [];

    try {
      const submissionResult = await pool.query(
        `
        SELECT
          scenario_id,
          score,
          maximum_marks,
          percentage,
          submitted_at
        FROM submissions
        WHERE team_id = $1
        ORDER BY submitted_at DESC
        `,
        [submissionTeamId(teamId)]
      );

      results = submissionResult.rows;
    } catch (submissionError) {
      /*
       * Do not make the dashboard fail simply because the
       * optional submission table has a different schema.
       *
       * The dashboard can still load team identity and show
       * zero completed scenarios.
       */
      console.warn(
        "[STUDENT DASHBOARD] Submission query unavailable:",
        submissionError
      );

      results = [];
    }

    return NextResponse.json(
      {
        success: true,
        team_id: teamResult.rows[0].team_id,
        team_name: teamResult.rows[0].team_name,
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "[STUDENT DASHBOARD API ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load student dashboard.",
      },
      { status: 500 }
    );
  }
}
