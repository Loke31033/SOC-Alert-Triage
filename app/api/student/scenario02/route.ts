import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import pool from "@/lib/db";
import { getStudentSession } from "@/lib/student-auth";
import {
  getContestState,
  getScenarioState,
} from "@/lib/contest-state";

export const runtime = "nodejs";

const SCENARIO_ID = "scenario02";

export async function GET() {
  try {

    /*
     * ==================================================
     * 1. AUTHENTICATE STUDENT
     * ==================================================
     */

    const session = await getStudentSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "Student authentication required.",
          code: "STUDENT_AUTH_REQUIRED",
        },
        { status: 401 }
      );
    }

    /*
     * ==================================================
     * 2. CONTEST MUST BE OPEN
     * ==================================================
     */

    const contest = await getContestState();

    if (contest.status !== "OPEN") {
      return NextResponse.json(
        {
          error: "Contest is currently closed.",
          code: "CONTEST_CLOSED",
          contest_status: contest.status,
        },
        { status: 403 }
      );
    }

    /*
     * ==================================================
     * 3. SCENARIO MUST BE ENABLED
     * ==================================================
     */

    const scenario = await getScenarioState(
      SCENARIO_ID
    );

    if (!scenario || !scenario.enabled) {
      return NextResponse.json(
        {
          error: `${SCENARIO_ID} is currently disabled.`,
          code: "SCENARIO_DISABLED",
          scenario_id: SCENARIO_ID,
        },
        { status: 403 }
      );
    }

    /*
     * ==================================================
     * 4. RESOLVE TEAM FROM DATABASE
     *
     * DO NOT enforce a hard-coded team01/team02 format.
     *
     * The signed student session supplies the identity.
     * PostgreSQL determines the canonical team ID.
     * ==================================================
     */

    const teamResult = await pool.query(
      `
      SELECT
        team_id,
        team_name
      FROM contest_teams
      WHERE LOWER(team_id) = LOWER($1)
      LIMIT 1
      `,
      [session.team_id]
    );

    if (teamResult.rows.length === 0) {

      console.error(
        "[STUDENT TEAM NOT FOUND]",
        {
          session_team_id: session.team_id,
          username: session.username,
        }
      );

      return NextResponse.json(
        {
          error: "Student team is not registered in contest_teams.",
          code: "TEAM_NOT_REGISTERED",
        },
        { status: 403 }
      );
    }

    /*
     * Use the canonical DB value.
     */

    const canonicalTeamId =
      String(teamResult.rows[0].team_id);

    /*
     * ==================================================
     * 5. VALIDATE TEAM ID FOR FILESYSTEM USE
     *
     * This prevents path traversal while allowing the
     * actual team naming convention used by the database.
     * ==================================================
     */

    if (!/^[A-Za-z0-9_-]+$/.test(canonicalTeamId)) {

      console.error(
        "[UNSAFE TEAM ID]",
        canonicalTeamId
      );

      return NextResponse.json(
        {
          error: "Invalid contest team configuration.",
          code: "INVALID_TEAM_CONFIGURATION",
        },
        { status: 500 }
      );
    }

    /*
     * ==================================================
     * 6. FIND TEAM QUESTION DIRECTORY
     *
     * Handles differences such as:
     *
     *   team01
     *   TEAM01
     *   Team01
     *
     * while still requiring the directory to exist.
     * ==================================================
     */

    const projectRoot =
      path.resolve(process.cwd(), "../..");

    const studentQuestionsRoot = path.join(
      projectRoot,
      "contest_questions",
      "student"
    );

    const teamDirectories =
      await fs.readdir(
        studentQuestionsRoot,
        { withFileTypes: true }
      );

    const teamDirectory =
      teamDirectories.find(
        (entry) =>
          entry.isDirectory() &&
          entry.name.toLowerCase() ===
            canonicalTeamId.toLowerCase()
      );

    if (!teamDirectory) {

      console.error(
        "[TEAM QUESTION DIRECTORY NOT FOUND]",
        {
          team_id: canonicalTeamId,
          scenario: SCENARIO_ID,
          root: studentQuestionsRoot,
        }
      );

      return NextResponse.json(
        {
          error:
            `Question package directory not found for team ${canonicalTeamId}.`,
          code: "TEAM_PACKAGE_DIRECTORY_MISSING",
        },
        { status: 500 }
      );
    }

    /*
     * ==================================================
     * 7. LOAD TEAM-SPECIFIC QUESTION PACKAGE
     * ==================================================
     */

    const questionFile = path.join(
      studentQuestionsRoot,
      teamDirectory.name,
      `${SCENARIO_ID}_questions.json`
    );

    const file =
      await fs.readFile(
        questionFile,
        "utf-8"
      );

    const questions =
      JSON.parse(file);

    /*
     * ==================================================
     * 8. PACKAGE INTEGRITY CHECK
     * ==================================================
     */

    if (
      String(questions.team_id).toLowerCase() !==
        canonicalTeamId.toLowerCase() ||
      questions.scenario_id !== SCENARIO_ID
    ) {

      console.error(
        "[QUESTION PACKAGE MISMATCH]",
        {
          authenticated_team:
            session.team_id,

          database_team:
            canonicalTeamId,

          package_team:
            questions.team_id,

          expected_scenario:
            SCENARIO_ID,

          package_scenario:
            questions.scenario_id,
        }
      );

      return NextResponse.json(
        {
          error:
            "Question package integrity check failed.",
          code: "PACKAGE_MISMATCH",
        },
        { status: 500 }
      );
    }

    /*
     * ==================================================
     * 9. RETURN QUESTIONS
     * ==================================================
     */

    return NextResponse.json(
      questions,
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );

  } catch (error) {

    console.error(
      "[STUDENT SCENARIO ERROR]",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load scenario questions.",
        code:
          "SCENARIO_LOAD_ERROR",
      },
      { status: 500 }
    );
  }
}
