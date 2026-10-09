import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAdminSession } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      teamId: string;
      scenarioId: string;
    }>;
  }
) {
  try {
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

    const { teamId, scenarioId } = await context.params;

    if (!teamId || !scenarioId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing team ID or scenario ID.",
        },
        { status: 400 }
      );
    }

    const submissionResult = await pool.query(
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
      WHERE team_id = $1
        AND scenario_id = $2
      ORDER BY submitted_at DESC
      LIMIT 1
      `,
      [teamId, scenarioId]
    );

    if (submissionResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Submission not found.",
        },
        { status: 404 }
      );
    }

    const submission = submissionResult.rows[0];

    const projectRoot = path.resolve(
      process.cwd(),
      "../.."
    );

    const answerKeyPath = path.join(
      projectRoot,
      "contest_questions",
      "organizer",
      teamId,
      `${scenarioId}_answer_key.json`
    );

    if (!fs.existsSync(answerKeyPath)) {
      return NextResponse.json(
        {
          success: false,
          error: "Organizer answer key not found.",
        },
        { status: 404 }
      );
    }

    const answerKeyPackage = JSON.parse(
      fs.readFileSync(answerKeyPath, "utf-8")
    );

    const answerKey = new Map<
      string,
      {
        correct_answer: string;
        marks: number;
      }
    >();

    for (const item of answerKeyPackage.answer_key) {
      answerKey.set(item.question_id, {
        correct_answer: item.correct_answer,
        marks: Number(item.marks),
      });
    }

    const studentAnswers = Array.isArray(
      submission.answers
    )
      ? submission.answers
      : [];

    const questions = studentAnswers.map(
      (studentAnswer: {
        question_id: string;
        answer: string;
      }) => {
        const key = answerKey.get(
          studentAnswer.question_id
        );

        if (!key) {
          return {
            question_id: studentAnswer.question_id,
            selected_answer: studentAnswer.answer,
            correct_answer: null,
            correct: false,
            marks_awarded: 0,
            maximum_marks: 0,
          };
        }

        const correct =
          studentAnswer.answer ===
          key.correct_answer;

        return {
          question_id: studentAnswer.question_id,
          selected_answer: studentAnswer.answer,
          correct_answer: key.correct_answer,
          correct,
          marks_awarded: correct
            ? key.marks
            : 0,
          maximum_marks: key.marks,
        };
      }
    );

    return NextResponse.json({
      success: true,

      team_id: teamId,
      scenario_id: scenarioId,

      submission: {
        id: submission.id,
        score: Number(submission.score),
        maximum_marks: Number(
          submission.maximum_marks
        ),
        percentage: Number(
          submission.percentage
        ),
        submitted_at: submission.submitted_at,
      },

      questions,

      // Compatibility with the existing Team Detail UI.
      question_results: questions,
    });
  } catch (error) {
    console.error(
      "[ADMIN QUESTION DETAIL API ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load question details.",
      },
      { status: 500 }
    );
  }
}
