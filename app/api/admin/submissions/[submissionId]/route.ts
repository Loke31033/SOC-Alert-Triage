import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import pool from "@/lib/db";
import { verifyAdminSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ submissionId: string }>;
  }
) {
  try {
    // --------------------------------------------------
    // ADMIN AUTHENTICATION
    // --------------------------------------------------

    const sessionToken =
      request.cookies.get("admin_session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    await verifyAdminSession(sessionToken);

    // --------------------------------------------------
    // SUBMISSION ID
    // --------------------------------------------------

    const { submissionId } = await context.params;

    if (!submissionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing submission ID.",
        },
        { status: 400 }
      );
    }

    const id = Number(submissionId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid submission ID.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // LOAD STORED SUBMISSION
    // --------------------------------------------------

    const result = await pool.query(
      `
      SELECT
        id,
        team_id,
        scenario_id,
        answers,
        score,
        maximum_marks,
        percentage,
        submitted_at
      FROM submissions
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Submission not found.",
        },
        { status: 404 }
      );
    }

    const storedSubmission = result.rows[0];

    // --------------------------------------------------
    // RECONSTRUCT SUBMISSION FOR EXISTING EVALUATOR
    // --------------------------------------------------

    const evaluatorSubmission = {
      submission_type: "student_mcq_submission",
      team_id: storedSubmission.team_id,
      scenario_id: storedSubmission.scenario_id,
      answers: storedSubmission.answers,
    };

    // --------------------------------------------------
    // EXISTING PYTHON EVALUATOR BRIDGE
    // --------------------------------------------------

    const projectRoot = path.resolve(process.cwd(), "../..");

    const pythonScript = path.join(
      projectRoot,
      "contest",
      "web_submission_bridge.py"
    );

    const python = spawn(
      "python3",
      [pythonScript],
      {
        cwd: projectRoot,
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    let stdout = "";
    let stderr = "";

    python.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    python.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    python.stdin.write(
      JSON.stringify(evaluatorSubmission)
    );

    python.stdin.end();

    const exitCode = await new Promise<number>(
      (resolve) => {
        python.on("close", (code) => {
          resolve(code ?? 1);
        });
      }
    );

    if (exitCode !== 0) {
      console.error(
        "[SUBMISSION AUDIT EVALUATOR ERROR]",
        stderr
      );

      return NextResponse.json(
        {
          success: false,
          error: "Evaluator failed.",
          details:
            stderr ||
            "Python evaluator returned an error.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // PARSE EVALUATOR RESULT
    // --------------------------------------------------

    let evaluation;

    try {
      evaluation = JSON.parse(stdout);
    } catch {
      console.error(
        "[SUBMISSION AUDIT INVALID JSON]",
        stdout
      );

      return NextResponse.json(
        {
          success: false,
          error: "Invalid evaluator response.",
        },
        { status: 500 }
      );
    }

    if (!evaluation.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            evaluation.error ||
            "Evaluator failed.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // RETURN STORED + EVALUATED RESULT
    // --------------------------------------------------

    return NextResponse.json({
      success: true,

      submission: {
        id: storedSubmission.id,

        team_id: storedSubmission.team_id,

        scenario_id:
          storedSubmission.scenario_id,

        submitted_at:
          storedSubmission.submitted_at,

        stored_score:
          Number(storedSubmission.score),

        stored_maximum_marks:
          Number(storedSubmission.maximum_marks),

        stored_percentage:
          Number(storedSubmission.percentage),

        answers:
          storedSubmission.answers,

        evaluator: {
          result_type:
            evaluation.result_type,

          evaluation_mode:
            evaluation.evaluation_mode,

          scenario_name:
            evaluation.scenario_name,

          total_questions:
            evaluation.total_questions,

          correct_answers:
            evaluation.correct_answers,

          incorrect_answers:
            evaluation.incorrect_answers,

          unanswered:
            evaluation.unanswered,

          maximum_marks:
            evaluation.maximum_marks,

          score:
            evaluation.score,

          percentage:
            evaluation.percentage,

          question_results:
            evaluation.question_results,
        },
      },
    });
  } catch (error) {
    console.error(
      "[ADMIN SUBMISSION AUDIT ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load submission audit.",
      },
      { status: 500 }
    );
  }
}
