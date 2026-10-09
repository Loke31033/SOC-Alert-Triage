import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { createAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Username and password are required.",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      SELECT id, username
      FROM admins
      WHERE username = $1
        AND password_hash = crypt($2, password_hash)
      LIMIT 1
      `,
      [username, password]
    );

    if (result.rowCount !== 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid administrator credentials.",
        },
        { status: 401 }
      );
    }

    const admin = result.rows[0];

    const token = await createAdminSession(
      admin.username
    );

    const response = NextResponse.json({
      success: true,
      username: admin.username,
    });

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;

  } catch (error) {
    console.error("[ADMIN LOGIN ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Authentication service error.",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}
