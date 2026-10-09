import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "student_session";

function getSecret() {
  const value =
    process.env.STUDENT_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET;

  if (!value) {
    throw new Error(
      "STUDENT_SESSION_SECRET or ADMIN_SESSION_SECRET is not configured."
    );
  }

  return new TextEncoder().encode(value);
}

export async function createStudentSession(
  username: string,
  teamId: string,
  teamName: string
) {
  return new SignJWT({
    username,
    team_id: teamId,
    team_name: teamName,
    role: "student",
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function getStudentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      getSecret()
    );

    if (
      payload.role !== "student" ||
      typeof payload.username !== "string" ||
      typeof payload.team_id !== "string"
    ) {
      return null;
    }

    return {
      username: payload.username,
      team_id: payload.team_id,
      team_name:
        typeof payload.team_name === "string"
          ? payload.team_name
          : "",
    };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
