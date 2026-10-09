import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getContestState } from "@/lib/contest-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[a-zA-Z0-9_-]+$/.test(value)
  );
}

function getKibanaBaseUrl(): string {
  const value = process.env.KIBANA_BASE_URL;

  if (!value) {
    throw new Error(
      "KIBANA_BASE_URL is not configured."
    );
  }

  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Invalid Kibana URL protocol.");
    }

    return url.origin;
  } catch {
    throw new Error(
      "KIBANA_BASE_URL must be a valid HTTP/HTTPS URL."
    );
  }
}

export async function GET(
  request: NextRequest
) {
  try {
    // --------------------------------------------------
    // REQUEST PARAMETERS
    // --------------------------------------------------

    const rawTeamId =
      request.nextUrl.searchParams.get("team_id");

    const teamId =
      typeof rawTeamId === "string"
        ? rawTeamId.trim().toLowerCase()
        : null;

    const scenarioId =
      request.nextUrl.searchParams.get("scenario_id");

    if (!isValidIdentifier(teamId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid team_id.",
        },
        { status: 400 }
      );
    }

    if (!isValidIdentifier(scenarioId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid scenario_id.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // CONTEST STATE
    // --------------------------------------------------

    const contest = await getContestState();

    if (contest.status !== "OPEN") {
      return NextResponse.json(
        {
          success: false,
          error: "Contest is not currently open.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // SCENARIO AVAILABILITY
    // --------------------------------------------------

    const scenarioResult = await pool.query(
      `
      SELECT
        scenario_id,
        enabled
      FROM scenario_state
      WHERE scenario_id = $1
      LIMIT 1
      `,
      [scenarioId]
    );

    if (scenarioResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Scenario not found.",
        },
        { status: 404 }
      );
    }

    if (!scenarioResult.rows[0].enabled) {
      return NextResponse.json(
        {
          success: false,
          error: "Scenario is not currently enabled.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // TEAM VALIDATION
    // --------------------------------------------------

    const teamResult = await pool.query(
      `
      SELECT team_id
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

    // --------------------------------------------------
    // --------------------------------------------------
    // TEAM/SCENARIO ACCESS
    // --------------------------------------------------
    //
    // The current database schema does not contain a
    // team_scenarios table.
    //
    // Team access is validated through the existing
    // teams table and scenario availability through
    // scenario_state.
    // --------------------------------------------------

    const assignmentStatus = "ENABLED";

    // KIBANA DESTINATION
    // --------------------------------------------------

    const kibanaBaseUrl = getKibanaBaseUrl();

    /*
     * The browser never supplies the Kibana destination.
     *
     * The server derives it from the validated
     * team/scenario identifiers.
     *
     * The actual Kibana/Elasticsearch security layer
     * must independently enforce index-level isolation.
     */

    const scenario01Dashboards: Record<string, string> = {
      team01: "c53748cb-8c25-45b1-bbb7-582330f1e4dd",
      team02: "20c66d24-9d39-49a0-bd3c-24bdc293b7d1",
      team03: "4d8fd7e1-4037-48a0-9996-d3ffffdc76fd",
      team04: "7448aa54-d7a7-4c28-a66d-87cc5fe4526d",
      team05: "6c24ec27-cd23-40a3-8c7c-d64dd80baa58",
      team06: "3b48ff25-9af9-4d34-90c6-9beadc43606d",
      team07: "6122fe7d-f4e3-4c5a-89f1-de7d7889c652",
      team08: "32e716a2-0d45-4065-bb1f-797e17298c78",
      team09: "d407c080-5ded-4182-bf80-565c56ca5e52",
      team10: "911a3534-e33a-4630-8e5e-ee15fa0c2c0b",
    };

    const dashboardId =
      scenarioId === "scenario01"
        ? scenario01Dashboards[teamId]
        : `soc-${scenarioId}-${teamId}-dashboard`;

    if (!dashboardId) {
      return NextResponse.json(
        {
          success: false,
          error: "Dashboard mapping not found.",
        },
        { status: 404 }
      );
    }

    const fromTime =
      scenarioId === "scenario04"
        ? "2026-10-01T14:00:00.000Z"
        : "2026-10-01T10:00:00.000Z";

    const toTime =
      scenarioId === "scenario04"
        ? "2026-10-01T15:30:00.000Z"
        : "2026-10-01T11:30:00.000Z";

    const kibanaUrl =
      `${kibanaBaseUrl}/app/dashboards#/view/${dashboardId}` +
      `?_g=(time:(from:'${fromTime}',to:'${toTime}'))`;

    return NextResponse.json({
      success: true,
      team_id: teamId,
      scenario_id: scenarioId,
      assignment_status: assignmentStatus,
      kibana_url: kibanaUrl,
    });
  } catch (error) {
    console.error(
      "[STUDENT KIBANA ACCESS ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create Kibana access.",
      },
      { status: 500 }
    );
  }
}
