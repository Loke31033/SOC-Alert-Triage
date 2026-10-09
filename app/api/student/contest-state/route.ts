import { NextResponse } from "next/server";
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

    const contest = await getContestState();

    const scenarioResults = await Promise.all(
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
        contest: {
          status: contest.status,
          started_at: contest.started_at,
          ended_at: contest.ended_at,
          updated_at: contest.updated_at,
        },
        scenarios: scenarioResults,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[STUDENT CONTEST STATE ERROR]", error);

    return NextResponse.json(
      { error: "Unable to load contest state." },
      { status: 500 }
    );
  }
}
