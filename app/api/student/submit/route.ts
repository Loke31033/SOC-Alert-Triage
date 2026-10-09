import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import pool from "@/lib/db";

export const runtime = "nodejs";

type EvaluationResult = {
  success: boolean;
  team_id: string;
  scenario_id: string;
  score: number;
  maximum_marks: number;
  percentage: number;
};

export async function POST(request: NextRequest) {
  try {
    const submission = await request.json();

    if (
      !submission ||
      submission.submission_type !== "student_mcq_submission" ||
      submission.submission_mode !== "web" ||
      !submission.team_id ||
      !submission.scenario_id ||
      !Array.isArray(submission.answers)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid submission format.",
        },
        { status: 400 }
      );
    }

    const projectRoot = path.resolve(process.cwd(), "../..");

    const pythonScript = path.join(
      projectRoot,
      "contest",
      "web_submission_bridge.py"
    );

    const python = spawn("python3", [pythonScript], {
      cwd: projectRoot,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    python.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    python.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    // Send normalized submission to the existing Python bridge.
    python.stdin.write(JSON.stringify(submission));
    python.stdin.end();

    const exitCode = await new Promise<number>((resolve) => {
      python.on("close", (code) => {
        resolve(code ?? 1);
      });
    });

    if (exitCode !== 0) {
      console.error("Evaluator bridge failed:", stderr);

      return NextResponse.json(
        {
          success: false,
          error: "Evaluation failed.",
          details:
            stderr || "Python evaluator returned an error.",
        },
        { status: 500 }
      );
    }

    let result: EvaluationResult;

    try {
      result = JSON.parse(stdout);
    } catch {
      console.error(
        "Invalid evaluator response:",
        stdout
      );

      return NextResponse.json(
        {
          success: false,
          error: "Invalid evaluator response.",
          details: stdout,
        },
        { status: 500 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        result,
        { status: 500 }
      );
    }

    // PostgreSQL stores the result produced by the
    // existing contest evaluator.
    await pool.query(
      `
      INSERT INTO submissions (
        team_id,
        scenario_id,
        answers,
        score,
        maximum_marks,
        percentage
      )
      VALUES ($1, $2, $3::jsonb, $4, $5, $6)
      `,
      [
        result.team_id,
        result.scenario_id,
        JSON.stringify(submission.answers),
        result.score,
        result.maximum_marks,
        result.percentage,
      ]
    );

    console.log(
      `[SUBMISSION SAVED] ${result.team_id} / ${result.scenario_id} = ${result.score}/${result.maximum_marks}`
    );

    return NextResponse.json({
      success: true,
      team_id: result.team_id,
      scenario_id: result.scenario_id,
      maximum_marks: result.maximum_marks,
      score: result.score,
      percentage: result.percentage,
    });

  } catch (error) {
    console.error(
      "Submission processing error:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      "[SUBMISSION API ERROR]",
      errorMessage
    );

    return NextResponse.json(
      {
        success: false,
        error: "Submission processing failed.",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
