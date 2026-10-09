import { SignJWT, jwtVerify } from "jose";

const secret = process.env.ADMIN_SESSION_SECRET;

if (!secret) {
  throw new Error(
    "ADMIN_SESSION_SECRET is not configured."
  );
}

const secretKey = new TextEncoder().encode(secret);

export async function createAdminSession(
  username: string
) {
  return await new SignJWT({
    username,
    role: "admin",
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretKey);
}

export async function verifyAdminSession(
  token: string
) {
  const { payload } = await jwtVerify(
    token,
    secretKey
  );

  if (
    payload.role !== "admin" ||
    typeof payload.username !== "string"
  ) {
    throw new Error("Invalid admin session.");
  }

  return payload;
}
