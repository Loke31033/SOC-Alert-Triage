import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { verifyAdminSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin(request: NextRequest) {
  const token =
    request.cookies.get("admin_session")?.value;

  if (!token) {
    throw new Error("Unauthorized.");
  }

  await verifyAdminSession(token);
}

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

/*
 * GET
 *
 * Returns:
 *   teams
 *   students
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const teamsResult = await pool.query(`
      SELECT
        team_id,
        team_name
      FROM contest_teams
      ORDER BY team_id
    `);

    const studentsResult = await pool.query(`
      SELECT
        username,
        team_id
      FROM contest_students
      ORDER BY team_id, username
    `);

    return NextResponse.json({
      success: true,
      teams: teamsResult.rows,
      students: studentsResult.rows,
    });

  } catch (error) {
    console.error(
      "[ADMIN MANAGEMENT GET ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load management data.",
      },
      {
        status:
          error instanceof Error &&
          error.message === "Unauthorized."
            ? 401
            : 500,
      }
    );
  }
}

/*
 * POST
 *
 * action:
 *
 *   create_team
 *   create_student
 */
export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    await requireAdmin(request);

    const body = await request.json();

    const action = clean(body?.action);

    if (action === "create_team") {

      const teamId =
        clean(body?.team_id).toUpperCase();

      const teamName =
        clean(body?.team_name);

      if (!teamId || !teamName) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Team ID and team name are required.",
          },
          { status: 400 }
        );
      }

      await client.query("BEGIN");

      const existing =
        await client.query(
          `
            SELECT team_id
            FROM contest_teams
            WHERE team_id = $1
            LIMIT 1
          `,
          [teamId]
        );

      if (existing.rows.length > 0) {
        await client.query("ROLLBACK");

        return NextResponse.json(
          {
            success: false,
            error: "Team already exists.",
          },
          { status: 409 }
        );
      }

      await client.query(
        `
          INSERT INTO contest_teams
            (team_id, team_name)
          VALUES
            ($1, $2)
        `,
        [teamId, teamName]
      );

      /*
       * The project also maintains the teams table.
       */
      await client.query(
        `
          INSERT INTO teams
            (team_id, team_name)
          VALUES
            ($1, $2)
          ON CONFLICT (team_id)
          DO UPDATE
          SET team_name = EXCLUDED.team_name
        `,
        [teamId, teamName]
      );

      await client.query("COMMIT");

      return NextResponse.json(
        {
          success: true,
          team: {
            team_id: teamId,
            team_name: teamName,
          },
        },
        { status: 201 }
      );
    }

    if (action === "create_student") {

      const username =
        clean(body?.username).toLowerCase();

      const password =
        clean(body?.password);

      const teamId =
        clean(body?.team_id).toUpperCase();

      if (!username || !password || !teamId) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Username, password and team are required.",
          },
          { status: 400 }
        );
      }

      const team =
        await client.query(
          `
            SELECT team_id
            FROM contest_teams
            WHERE team_id = $1
            LIMIT 1
          `,
          [teamId]
        );

      if (team.rows.length !== 1) {
        return NextResponse.json(
          {
            success: false,
            error: "Selected team does not exist.",
          },
          { status: 404 }
        );
      }

      const existing =
        await client.query(
          `
            SELECT username
            FROM contest_students
            WHERE username = $1
            LIMIT 1
          `,
          [username]
        );

      if (existing.rows.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Username already exists.",
          },
          { status: 409 }
        );
      }

      const passwordHash =
        await bcrypt.hash(password, 12);

      await client.query(
        `
          INSERT INTO contest_students
            (team_id, username, password_hash)
          VALUES
            ($1, $2, $3)
        `,
        [
          teamId,
          username,
          passwordHash,
        ]
      );

      return NextResponse.json(
        {
          success: true,
          student: {
            username,
            team_id: teamId,
          },
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unsupported management action.",
      },
      { status: 400 }
    );

  } catch (error) {

    try {
      await client.query("ROLLBACK");
    } catch {}

    console.error(
      "[ADMIN MANAGEMENT POST ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Management operation failed.",
      },
      {
        status:
          error instanceof Error &&
          error.message === "Unauthorized."
            ? 401
            : 500,
      }
    );

  } finally {
    client.release();
  }
}

/*
 * PATCH
 *
 * action:
 *
 *   edit_team
 *   edit_student
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();

    const action = clean(body?.action);

    if (action === "edit_team") {

      const teamId =
        clean(body?.team_id).toUpperCase();

      const teamName =
        clean(body?.team_name);

      if (!teamId || !teamName) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Team ID and team name are required.",
          },
          { status: 400 }
        );
      }

      const result =
        await pool.query(
          `
            UPDATE contest_teams
            SET team_name = $2
            WHERE team_id = $1
            RETURNING team_id, team_name
          `,
          [teamId, teamName]
        );

      if (result.rows.length !== 1) {
        return NextResponse.json(
          {
            success: false,
            error: "Team not found.",
          },
          { status: 404 }
        );
      }

      await pool.query(
        `
          UPDATE teams
          SET team_name = $2
          WHERE team_id = $1
        `,
        [teamId, teamName]
      );

      return NextResponse.json({
        success: true,
        team: result.rows[0],
      });
    }

    if (action === "edit_student") {

      const username =
        clean(body?.username).toLowerCase();

      const newTeamId =
        clean(body?.team_id).toUpperCase();

      const password =
        clean(body?.password);

      if (!username || !newTeamId) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Username and team are required.",
          },
          { status: 400 }
        );
      }

      const team =
        await pool.query(
          `
            SELECT team_id
            FROM contest_teams
            WHERE team_id = $1
            LIMIT 1
          `,
          [newTeamId]
        );

      if (team.rows.length !== 1) {
        return NextResponse.json(
          {
            success: false,
            error: "Selected team does not exist.",
          },
          { status: 404 }
        );
      }

      if (password) {

        const passwordHash =
          await bcrypt.hash(password, 12);

        const result =
          await pool.query(
            `
              UPDATE contest_students
              SET
                team_id = $2,
                password_hash = $3
              WHERE username = $1
              RETURNING username, team_id
            `,
            [
              username,
              newTeamId,
              passwordHash,
            ]
          );

        if (result.rows.length !== 1) {
          return NextResponse.json(
            {
              success: false,
              error: "Student not found.",
            },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          student: result.rows[0],
        });
      }

      const result =
        await pool.query(
          `
            UPDATE contest_students
            SET team_id = $2
            WHERE username = $1
            RETURNING username, team_id
          `,
          [username, newTeamId]
        );

      if (result.rows.length !== 1) {
        return NextResponse.json(
          {
            success: false,
            error: "Student not found.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        student: result.rows[0],
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unsupported management action.",
      },
      { status: 400 }
    );

  } catch (error) {

    console.error(
      "[ADMIN MANAGEMENT PATCH ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Management update failed.",
      },
      {
        status:
          error instanceof Error &&
          error.message === "Unauthorized."
            ? 401
            : 500,
      }
    );
  }
}

/*
 * DELETE
 *
 * action:
 *
 *   delete_student
 *
 * Delete Team remains handled by the
 * existing /api/admin/teams/[teamId] route.
 */
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();

    const action = clean(body?.action);

    if (action !== "delete_student") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Use the existing team DELETE endpoint for teams.",
        },
        { status: 400 }
      );
    }

    const username =
      clean(body?.username).toLowerCase();

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          error: "Username is required.",
        },
        { status: 400 }
      );
    }

    const result =
      await pool.query(
        `
          DELETE FROM contest_students
          WHERE username = $1
          RETURNING username, team_id
        `,
        [username]
      );

    if (result.rows.length !== 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Student not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student: result.rows[0],
    });

  } catch (error) {

    console.error(
      "[ADMIN MANAGEMENT DELETE ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Student deletion failed.",
      },
      {
        status:
          error instanceof Error &&
          error.message === "Unauthorized."
            ? 401
            : 500,
      }
    );
  }
}
