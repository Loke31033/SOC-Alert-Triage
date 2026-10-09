import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/student-auth";
import {
  getContestState,
  getScenarioState,
} from "@/lib/contest-state";

export async function requireStudentContest(
  scenarioId?: string
) {
  const session = await getStudentSession();

  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: "Student authentication required.",
          code: "STUDENT_AUTH_REQUIRED",
        },
        { status: 401 }
      ),
    };
  }

  const contest = await getContestState();

  if (contest.status !== "OPEN") {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: "Contest is currently closed.",
          code: "CONTEST_CLOSED",
          contest_status: contest.status,
        },
        { status: 403 }
      ),
    };
  }

  if (scenarioId) {
    const scenario =
      await getScenarioState(scenarioId);

    if (!scenario || !scenario.enabled) {
      return {
        ok: false as const,
        response: NextResponse.json(
          {
            error: `${scenarioId} is currently disabled.`,
            code: "SCENARIO_DISABLED",
            scenario_id: scenarioId,
          },
          { status: 403 }
        ),
      };
    }
  }

  return {
    ok: true as const,
    session,
    contest,
  };
}
