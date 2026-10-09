import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

async function requireExistingAdminAuth(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";

  if (!cookie) {
    return false;
  }

  const origin = new URL(request.url).origin;

  const response = await fetch(`${origin}/api/admin/overview`, {
    method: "GET",
    headers: { cookie },
    cache: "no-store",
  });

  return response.ok;
}

export async function GET(request: Request) {
  try {
    if (!(await requireExistingAdminAuth(request))) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const requestedStatus =
      new URL(request.url).searchParams.get("status")?.toUpperCase() || "ALL";

    const allowed = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"];
    const status = allowed.includes(requestedStatus)
      ? requestedStatus
      : "ALL";

    const params: string[] = [];
    let where = "";

    if (status !== "ALL") {
      params.push(status);
      where = "WHERE status = $1";
    }

    const result = await pool.query(
      `
        SELECT id, team_id, username, message, status, admin_reply,
               created_at, updated_at, resolved_at
        FROM contest_reports
        ${where}
        ORDER BY
          CASE status
            WHEN 'OPEN' THEN 1
            WHEN 'IN_PROGRESS' THEN 2
            WHEN 'RESOLVED' THEN 3
            ELSE 4
          END,
          created_at DESC
      `,
      params
    );

    return NextResponse.json({
      success: true,
      reports: result.rows,
    });
  } catch (error) {
    console.error("GET /api/admin/reports:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load support reports." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await requireExistingAdminAuth(request))) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const id = Number(body?.id);
    const status =
      typeof body?.status === "string"
        ? body.status.toUpperCase()
        : undefined;

    const adminReply =
      typeof body?.admin_reply === "string"
        ? body.admin_reply.trim()
        : undefined;

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid report ID." },
        { status: 400 }
      );
    }

    if (
      status !== undefined &&
      !["OPEN", "IN_PROGRESS", "RESOLVED"].includes(status)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid report status." },
        { status: 400 }
      );
    }

    if (adminReply !== undefined && adminReply.length > 5000) {
      return NextResponse.json(
        { success: false, message: "Admin reply is too long." },
        { status: 400 }
      );
    }

    if (status === undefined && adminReply === undefined) {
      return NextResponse.json(
        { success: false, message: "Nothing to update." },
        { status: 400 }
      );
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    let parameter = 1;

    if (status !== undefined) {
      fields.push(`status = $${parameter++}`);
      values.push(status);

      fields.push(
        status === "RESOLVED"
          ? "resolved_at = NOW()"
          : "resolved_at = NULL"
      );
    }

    if (adminReply !== undefined) {
      fields.push(`admin_reply = $${parameter++}`);
      values.push(adminReply || null);
    }

    values.push(id);

    const result = await pool.query(
      `
        UPDATE contest_reports
        SET ${fields.join(", ")}
        WHERE id = $${parameter}
        RETURNING id, team_id, username, message, status, admin_reply,
                  created_at, updated_at, resolved_at
      `,
      values
    );

    if (!result.rowCount) {
      return NextResponse.json(
        { success: false, message: "Report not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      report: result.rows[0],
    });
  } catch (error) {
    console.error("PATCH /api/admin/reports:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update support report." },
      { status: 500 }
    );
  }
}
