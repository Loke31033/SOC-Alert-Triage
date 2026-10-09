import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import {
  createStudentSession,
  COOKIE_NAME,
} from "@/lib/student-auth";

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function validIdentifier(value: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const username = clean(body?.username).toLowerCase();
    const password = clean(body?.password);

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Username and password are required.",
        },
        { status: 400 }
      );
    }

    if (!validIdentifier(username)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Username may contain only letters, numbers, underscore and hyphen.",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        SELECT
          cs.username,
          cs.team_id,
          cs.password_hash,
          ct.team_name
        FROM contest_students cs
        INNER JOIN contest_teams ct
          ON ct.team_id = cs.team_id
        WHERE cs.username = $1
        LIMIT 1
      `,
      [username]
    );

    if (result.rows.length !== 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid username or password.",
        },
        { status: 401 }
      );
    }

    const student = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      student.password_hash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid username or password.",
        },
        { status: 401 }
      );
    }

    const token = await createStudentSession(
      student.username,
      student.team_id,
      student.team_name
    );

    const response = NextResponse.json(
      {
        success: true,
        username: student.username,
        team_id: student.team_id,
        team_name: student.team_name,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("[STUDENT LOGIN ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Student login failed.",
      },
      { status: 500 }
    );
  }
}
