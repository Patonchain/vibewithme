import * as jose from "jose";

const SECRET = new TextEncoder().encode(
  process.env.VWM_JWT_SECRET || "vibewithme-dev-secret-change-in-production",
);

const ISSUER = "vibewithme";
const AUDIENCE = "vibewithme-client";

export interface TokenPayload {
  userId: string;
  name: string;
  email: string;
  color: string;
}

export async function createAccessToken(
  payload: TokenPayload,
): Promise<string> {
  return new jose.SignJWT({
    userId: payload.userId,
    name: payload.name,
    email: payload.email,
    color: payload.color,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime("15m")
    .sign(SECRET);
}

export async function createRefreshToken(userId: string): Promise<string> {
  return new jose.SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(
  token: string,
): Promise<TokenPayload & { exp?: number }> {
  const { payload } = await jose.jwtVerify(token, SECRET, {
    issuer: ISSUER,
    audience: AUDIENCE,
  });

  return payload as unknown as TokenPayload & { exp?: number };
}
