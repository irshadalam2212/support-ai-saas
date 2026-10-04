import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_SECRET = (() => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }
  return secret;
})();

if (!ACCESS_TOKEN_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not defined");
}
export interface AccessTokenPayload {
  sub: string;
  type: "access";
  jti: string;
  role: string;
  email: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: number;
}

export const generateAccessToken = (
  userId: string,
  role: string,
  email: string,
) => {
  const payload: AccessTokenPayload = {
    sub: userId,
    type: "access",
    jti: crypto.randomUUID(),
    role,
    email,
  };

  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    issuer: "support-ai",
    audience: "support-ai-api",
  });
};

export const generateRefreshToken = (payload: RefreshTokenPayload) => {
  const expiresInDays = Number(process.env.REFRESH_TOKEN_EXPIRES_IN || 20);
  if (!Number.isInteger(expiresInDays) || expiresInDays < 1) {
    throw new Error("REFRESH_TOKEN_EXPIRES_IN must be a positive number of days");
  }
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: `${expiresInDays}d` as SignOptions["expiresIn"],
  });
};

export const hashRefreshToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export function verifyRefreshToken(token: string) {
  const decoded: unknown = jwt.verify(
    token,
    REFRESH_TOKEN_SECRET,
  );

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    !("userId" in decoded) ||
    typeof decoded.userId !== "string" ||
    !decoded.userId ||
    !("tokenId" in decoded) ||
    typeof decoded.tokenId !== "number" ||
    !Number.isInteger(decoded.tokenId)
  ) {
    throw new Error("Invalid refresh token payload");
  }

  return {
    userId: decoded.userId,
    tokenId: decoded.tokenId,
  } satisfies RefreshTokenPayload;
}
