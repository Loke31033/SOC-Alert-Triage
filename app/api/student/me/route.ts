import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  getContestState,
  getScenarioState,
} from "@/lib/contest-state";
import { getStudentSession } from "@/lib/student-auth";

export const runtime = "nodejs";

const SCENARIOS = [
  "scenario01",
  "scenario02",
  "scenario03",
  "scenario04",
];

export async function GET() {
  try {
    const session = await getStudentSession();

    if (!session) {
      return NextResponse.json(
        { error: "Student authentication required." },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `
      SELECT team_id, team_name
      FROM contest_teams
      WHERE team_id = $1
      LIMIT 1
      `,
      [session.team_id]
    );

    const teamName =
      result.rows[0]?.team_name || session.team_name;

    const contest = await getContestState();

    const scenarios = await Promise.all(
      SCENARIOS.map(async (scenario_id) => {
        const state = await getScenarioState(scenario_id);

        return {
          scenario_id,
          enabled: Boolean(state?.enabled),
          updated_at: state?.updated_at ?? null,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,

        username: session.username,

        team_id: session.team_id,

        team_name: teamName,

        contest_status: contest.status,

        contest_started_at: contest.started_at,

        contest_ended_at: contest.ended_at,

        contest_updated_at: contest.updated_at,

        scenarios,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[STUDENT ME ERROR]", error);

    return NextResponse.json(
      { error: "Unable to load student identity." },
      { status: 500 }
    );
  }
}
