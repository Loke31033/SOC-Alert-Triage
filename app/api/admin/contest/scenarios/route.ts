import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAdminSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    await verifyAdminSession(token);

    const body = await request.json();

    const scenarioId = body?.scenario_id;
    const enabled = body?.enabled;

    if (
      typeof scenarioId !== "string" ||
      typeof enabled !== "boolean"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid scenario control request.",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      UPDATE scenario_state
      SET
        enabled = $2,
        updated_at = NOW()
      WHERE scenario_id = $1
      RETURNING scenario_id, enabled, updated_at
      `,
      [scenarioId, enabled]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Scenario not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      scenario: result.rows[0],
    });
  } catch (error) {
    console.error("[SCENARIO CONTROL]", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update scenario.",
      },
      { status: 500 }
    );
  }
}
