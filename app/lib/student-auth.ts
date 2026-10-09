import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "student_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

type StudentSession = {
  username: string;
  team_id: string;
  exp: number;
};

function getSecret(): string {
  const secret = process.env.STUDENT_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("STUDENT_SESSION_SECRET is missing or too short.");
  }

  return secret;
}

function sign(value: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(value)
    .digest("base64url");
}

function encode(session: StudentSession): string {
  const payload = Buffer
    .from(JSON.stringify(session))
    .toString("base64url");

  return `${payload}.${sign(payload)}`;
}

function decode(token: string): StudentSession | null {
  const parts = token.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const [payload, signature] = parts;

  const expected = sign(payload);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);

  if (
    a.length !== b.length ||
    !crypto.timingSafeEqual(a, b)
  ) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as StudentSession;

    if (
      typeof session.username !== "string" ||
      typeof session.team_id !== "string" ||
      typeof session.exp !== "number"
    ) {
      return null;
    }

    if (session.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function createStudentSession(
  username: string,
  team_id: string
): string {
  const session: StudentSession = {
    username,
    team_id,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  return encode(session);
}

export function setStudentSessionCookie(
  response: Response,
  token: string
): void {
  const headers = new Headers(response.headers);

  headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}; ${
      process.env.NODE_ENV === "production" ? "Secure; " : ""
    }`
  );

  response.headers.set("Set-Cookie", headers.get("Set-Cookie")!);
}

export async function getStudentSession(): Promise<StudentSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return decode(token);
}
