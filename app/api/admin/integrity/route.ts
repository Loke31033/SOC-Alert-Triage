import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAdminSession } from "@/lib/auth";
import {
  compareEvaluationResults,
  validateSubmissionIntegrity,
} from "@/lib/submissionIntegrity";

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

    const result = await pool.query(`
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
      ORDER BY submitted_at DESC
    `);

    const audits = result.rows.map((row) => {
      const integrity = validateSubmissionIntegrity(
        row.answers,
        row.team_id,
        row.scenario_id,
        row.team_id,
        row.scenario_id
      );

      return {
        submission_id: row.id,
        team_id: row.team_id,
        scenario_id: row.scenario_id,
        score: Number(row.score),
        maximum_marks: Number(row.maximum_marks),
        percentage: Number(row.percentage),
        submitted_at: row.submitted_at,
        integrity,
      };
    });

    const invalid = audits.filter(
      (audit) => !audit.integrity.valid
    );

    return NextResponse.json({
      success: true,
      summary: {
        total_submissions: audits.length,
        valid_submissions:
          audits.length - invalid.length,
        invalid_submissions: invalid.length,
      },
      audits,
    });
  } catch (error) {
    console.error("[INTEGRITY API ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Integrity audit failed.",
      },
      { status: 500 }
    );
  }
}
