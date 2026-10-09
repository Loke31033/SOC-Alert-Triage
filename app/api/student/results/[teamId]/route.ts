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


export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ teamId: string }>;
  }
) {
  try {
    const { teamId } = await context.params;

    if (!teamId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing team ID.",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      SELECT
        scenario_id,
        score,
        maximum_marks,
        percentage,
        submitted_at
      FROM submissions
      WHERE team_id = $1
      ORDER BY scenario_id
      `,
      [submissionTeamId(teamId)]
    );

    return NextResponse.json({
      success: true,
      team_id: teamId,
      results: result.rows,
    });

  } catch (error) {
    console.error(
      "[STUDENT RESULTS ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load student results.",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}
