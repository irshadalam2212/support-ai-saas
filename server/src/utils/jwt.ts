import jwt, { Secret, SignOptions } from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";

if (!ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET is not defined");
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
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as Secret, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
  });
};

export const hashRefreshToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export function verifyRefreshToken(token: string) {
  return jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET as Secret,
  ) as RefreshTokenPayload;
}
