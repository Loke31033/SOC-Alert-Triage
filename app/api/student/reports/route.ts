import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getStudentSession } from "@/lib/student-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getStudentSession();

    if (!session?.team_id || !session?.username) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `
        SELECT id, team_id, username, message, status, admin_reply,
               created_at, updated_at, resolved_at
        FROM contest_reports
        WHERE team_id = $1 AND username = $2
        ORDER BY created_at DESC
      `,
      [session.team_id, session.username]
    );

    return NextResponse.json({
      success: true,
      reports: result.rows,
    });
  } catch (error) {
    console.error("GET /api/student/reports:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load support reports." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getStudentSession();

    if (!session?.team_id || !session?.username) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const message =
      typeof body?.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Please describe the issue." },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { success: false, message: "Issue description is too long." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        INSERT INTO contest_reports
          (team_id, username, message)
        VALUES
          ($1, $2, $3)
        RETURNING id, team_id, username, message, status, admin_reply,
                  created_at, updated_at, resolved_at
      `,
      [session.team_id, session.username, message]
    );

    return NextResponse.json(
      {
        success: true,
        report: result.rows[0],
        message: "Support request submitted.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/student/reports:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit support request." },
      { status: 500 }
    );
  }
}
