import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAdminSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCENARIOS = [
  "scenario01",
  "scenario02",
  "scenario03",
  "scenario04",
];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const sessionToken = request.cookies.get("admin_session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    await verifyAdminSession(sessionToken);

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

    const teamResult = await pool.query(
      `
      SELECT
        team_id,
        team_name
      FROM teams
      WHERE team_id = $1
      LIMIT 1
      `,
      [teamId]
    );

    if (teamResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Team not found.",
        },
        { status: 404 }
      );
    }

    const submissionResult = await pool.query(
      `
      SELECT
        team_id,
        scenario_id,
        score,
        maximum_marks,
        percentage,
        submitted_at
      FROM submissions
      WHERE team_id = $1
      ORDER BY submitted_at DESC
      `,
      [teamId]
    );

    const latestByScenario = new Map<string, any>();

    for (const row of submissionResult.rows) {
      if (!latestByScenario.has(row.scenario_id)) {
        latestByScenario.set(row.scenario_id, row);
      }
    }

    const scenarios = SCENARIOS.map((scenarioId) => {
      const submission = latestByScenario.get(scenarioId);

      return {
        scenario_id: scenarioId,
        submitted: Boolean(submission),
        score: submission ? Number(submission.score) : 0,
        maximum_marks: submission
          ? Number(submission.maximum_marks)
          : 100,
        percentage: submission
          ? Number(submission.percentage)
          : 0,
        submitted_at: submission
          ? submission.submitted_at
          : null,
      };
    });

    const completedScenarios = scenarios.filter(
      (scenario) => scenario.submitted
    ).length;

    const totalScore = scenarios.reduce(
      (sum, scenario) => sum + scenario.score,
      0
    );

    const totalMaximumMarks = scenarios.reduce(
      (sum, scenario) => sum + scenario.maximum_marks,
      0
    );

    const overallPercentage =
      totalMaximumMarks > 0
        ? Number(
            ((totalScore / totalMaximumMarks) * 100).toFixed(2)
          )
        : 0;

    return NextResponse.json({
      success: true,

      team: {
        team_id: teamResult.rows[0].team_id,
        team_name: teamResult.rows[0].team_name,
      },

      overview: {
        total_score: totalScore,
        maximum_marks: totalMaximumMarks,
        percentage: overallPercentage,
        completed_scenarios: completedScenarios,
        total_scenarios: SCENARIOS.length,
        pending_scenarios:
          SCENARIOS.length - completedScenarios,
      },

      scenarios,

      submission_history: submissionResult.rows.map(
        (row) => ({
          scenario_id: row.scenario_id,
          score: Number(row.score),
          maximum_marks: Number(row.maximum_marks),
          percentage: Number(row.percentage),
          submitted_at: row.submitted_at,
        })
      ),
    });
  } catch (error) {
    console.error("[ADMIN TEAM API ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load team details.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  const client = await pool.connect();

  try {
    const sessionToken =
      request.cookies.get("admin_session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    await verifyAdminSession(sessionToken);

    const { teamId } = await context.params;

    const normalizedTeamId =
      String(teamId || "").trim();

    if (!normalizedTeamId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing team ID.",
        },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    /*
     * The project contains both:
     *
     *   teams
     *   contest_teams
     *
     * Registration creates the team in both tables.
     *
     * contest_students references contest_teams,
     * therefore students are removed first.
     */

    const teamCheck = await client.query(
      `
        SELECT
          team_id,
          team_name
        FROM teams
        WHERE team_id = $1
        LIMIT 1
      `,
      [normalizedTeamId]
    );

    if (teamCheck.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          error: "Team not found.",
        },
        { status: 404 }
      );
    }

    const team = teamCheck.rows[0];

    await client.query(
      `
        DELETE FROM contest_students
        WHERE team_id = $1
      `,
      [normalizedTeamId]
    );

    await client.query(
      `
        DELETE FROM contest_teams
        WHERE team_id = $1
      `,
      [normalizedTeamId]
    );

    await client.query(
      `
        DELETE FROM teams
        WHERE team_id = $1
      `,
      [normalizedTeamId]
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Team deleted successfully.",
        team: {
          team_id: team.team_id,
          team_name: team.team_name,
        },
      },
      { status: 200 }
    );

  } catch (error) {

    try {
      await client.query("ROLLBACK");
    } catch {
      // Ignore rollback failure.
    }

    console.error(
      "[ADMIN DELETE TEAM ERROR]",
      error
    );

    if (
      error instanceof Error &&
      error.message === "Unauthorized."
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unable to delete team.",
      },
      { status: 500 }
    );

  } finally {
    client.release();
  }
}

