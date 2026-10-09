export type SubmissionAnswer = {
  question_id: string;
  answer: string;
};

export type IntegrityResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

const QUESTION_COUNT = 10;
const QUESTION_IDS = Array.from(
  { length: QUESTION_COUNT },
  (_, index) => `Q${String(index + 1).padStart(2, "0")}`
);

const VALID_ANSWERS = new Set(["A", "B", "C", "D"]);

export function validateSubmissionIntegrity(
  answers: unknown,
  expectedTeamId?: string,
  expectedScenarioId?: string,
  submittedTeamId?: string,
  submittedScenarioId?: string
): IntegrityResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(answers)) {
    errors.push("answers must be an array.");
    return { valid: false, errors, warnings };
  }

  if (answers.length !== QUESTION_COUNT) {
    errors.push(
      `Expected exactly ${QUESTION_COUNT} answers; received ${answers.length}.`
    );
  }

  const seen = new Set<string>();

  for (const item of answers) {
    if (!item || typeof item !== "object") {
      errors.push("Invalid answer object.");
      continue;
    }

    const answer = item as Record<string, unknown>;
    const questionId = answer.question_id;
    const selectedAnswer = answer.answer;

    if (typeof questionId !== "string") {
      errors.push("Answer contains an invalid question_id.");
      continue;
    }

    if (seen.has(questionId)) {
      errors.push(`Duplicate question: ${questionId}.`);
    }

    seen.add(questionId);

    if (!QUESTION_IDS.includes(questionId)) {
      errors.push(`Unexpected question ID: ${questionId}.`);
    }

    if (
      typeof selectedAnswer !== "string" ||
      !VALID_ANSWERS.has(selectedAnswer)
    ) {
      errors.push(
        `Invalid answer for ${questionId}: ${String(selectedAnswer)}.`
      );
    }
  }

  for (const questionId of QUESTION_IDS) {
    if (!seen.has(questionId)) {
      errors.push(`Missing answer for ${questionId}.`);
    }
  }

  if (
    expectedTeamId &&
    submittedTeamId &&
    expectedTeamId !== submittedTeamId
  ) {
    errors.push("Submission team does not match the expected team.");
  }

  if (
    expectedScenarioId &&
    submittedScenarioId &&
    expectedScenarioId !== submittedScenarioId
  ) {
    errors.push("Submission scenario does not match the expected scenario.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function compareEvaluationResults(
  storedScore: number,
  storedMaximumMarks: number,
  storedPercentage: number,
  evaluatorScore: number,
  evaluatorMaximumMarks: number,
  evaluatorPercentage: number
): IntegrityResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (storedScore !== evaluatorScore) {
    errors.push(
      `Score mismatch: stored=${storedScore}, evaluator=${evaluatorScore}.`
    );
  }

  if (storedMaximumMarks !== evaluatorMaximumMarks) {
    errors.push(
      `Maximum marks mismatch: stored=${storedMaximumMarks}, evaluator=${evaluatorMaximumMarks}.`
    );
  }

  if (
    Number(storedPercentage.toFixed(2)) !==
    Number(evaluatorPercentage.toFixed(2))
  ) {
    errors.push(
      `Percentage mismatch: stored=${storedPercentage}, evaluator=${evaluatorPercentage}.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
