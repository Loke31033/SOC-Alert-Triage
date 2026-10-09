import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAdminSession } from "@/lib/auth";
import {
  getContestState,
} from "@/lib/contest-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
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

    const contest = await getContestState();

    const scenarios = await pool.query(`
      SELECT
        s.scenario_id,
        s.enabled
      FROM scenario_state s
      ORDER BY s.scenario_id
    `);

    return NextResponse.json({
      success: true,
      contest,
      scenarios: scenarios.rows,
    });
  } catch (error) {
    console.error("[CONTEST STATE GET]", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load contest state.",
      },
      { status: 500 }
    );
  }
}

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

    const action = body?.action;

    if (
      action !== "OPEN" &&
      action !== "CLOSE"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid contest action.",
        },
        { status: 400 }
      );
    }

    if (action === "OPEN") {
      await pool.query(`
        UPDATE contest_state
        SET
          status = 'OPEN',
          started_at = COALESCE(started_at, NOW()),
          ended_at = NULL,
          updated_at = NOW()
        WHERE id = 1
      `);
    } else {
      await pool.query(`
        UPDATE contest_state
        SET
          status = 'CLOSED',
          ended_at = NOW(),
          updated_at = NOW()
        WHERE id = 1
      `);
    }

    const contest = await getContestState();

    return NextResponse.json({
      success: true,
      contest,
    });
  } catch (error) {
    console.error("[CONTEST STATE UPDATE]", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update contest state.",
      },
      { status: 500 }
    );
  }
}
