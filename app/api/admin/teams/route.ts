import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await verifyAdminSession(token);

    const teamsResult = await pool.query(`
      SELECT
        t.team_id,
        t.team_name
      FROM teams t
      ORDER BY t.team_id
    `);

    const submissionsResult = await pool.query(`
      SELECT
        team_id,
        scenario_id,
        score,
        maximum_marks,
        percentage,
        submitted_at
      FROM submissions
      ORDER BY submitted_at DESC
    `);

    const submissions = submissionsResult.rows;

    const teams = teamsResult.rows.map((team) => {
      const teamSubmissions = submissions.filter(
        (submission) =>
          submission.team_id === team.team_id
      );

      const scenarioMap: Record<string, unknown> = {};

      for (const scenarioId of [
        "scenario01",
        "scenario02",
        "scenario03",
        "scenario04",
      ]) {
        const submission =
          teamSubmissions.find(
            (item) =>
              item.scenario_id === scenarioId
          );

        scenarioMap[scenarioId] =
          submission || null;
      }

      const totalScore = teamSubmissions.reduce(
        (sum, item) =>
          sum + Number(item.score || 0),
        0
      );

      const completed =
        teamSubmissions.length;

      return {
        team_id: team.team_id,
        team_name: team.team_name,
        completed,
        total_scenarios: 4,
        total_score: totalScore,
        scenarios: scenarioMap,
      };
    });

    return NextResponse.json({
      success: true,
      teams,
    });

  } catch (error) {
    console.error(
      "[ADMIN TEAMS ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load team data.",
      },
      { status: 500 }
    );
  }
}
