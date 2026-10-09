export type ContestState =
  | "scheduled"
  | "open"
  | "paused"
  | "closed";

const VALID_STATES: ContestState[] = [
  "scheduled",
  "open",
  "paused",
  "closed",
];

export function getContestState(): ContestState {
  const value = process.env.CONTEST_STATE;

  if (
    value &&
    VALID_STATES.includes(value as ContestState)
  ) {
    return value as ContestState;
  }

  return "open";
}

export function isSubmissionAllowed(): boolean {
  return getContestState() === "open";
}
