import bcrypt from "bcrypt";
import type { Prisma } from "@prisma/client";
import * as authRepository from "./auth.repository";
import { AppError } from "../../utils/apperror";
import { LoginInput, RegisterInput } from "./auth.validation";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  RefreshTokenPayload,
  verifyRefreshToken,
} from "../../utils/jwt";
import prisma from "../../config/prisma";
import { randomUUID } from "crypto";
import { generateResetToken, hashResetToken } from "../../utils/passwordReset";
import { sendPasswordResetEmail } from "../../services/email.service";

export const register = async (body: RegisterInput) => {
  const email = body.email.trim().toLowerCase();
  const existingUser = await authRepository.findUserByEmail(email);

  if (existingUser) {
    throw new AppError(409, "Email already registered");
  }

  const hashedPassword = await bcrypt.hash(body.password, 12);

  const user = await authRepository.createUser({
    ...body,
    email,
    password: hashedPassword,
  });

  return user;
};

export const login = async (body: LoginInput) => {
  const email = body.email.trim().toLowerCase();
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw new AppError(404, "User not registered");
  }

  const isPasswordMatch = await bcrypt.compare(body.password, user.password);

  if (!isPasswordMatch) {
    throw new AppError(401, "Invalid email or password");
  }

  const access_token = generateAccessToken(user.id, user.user_role, user.email);
  const refresh_token = await createRefreshToken(user.id);

  return {
    access_token,
    refresh_token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.user_role,
    },
  };
};

const refreshTokenLifetimeDays = () => {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_IN || 20);
  if (!Number.isInteger(days) || days < 1) {
    throw new Error("REFRESH_TOKEN_EXPIRES_IN must be a positive number of days");
  }
  return days;
};

const createRefreshTokenRecord = async (
  tx: Prisma.TransactionClient,
  userId: string,
  familyId: string,
) => {
  const expiresAt = new Date(Date.now() + refreshTokenLifetimeDays() * 86400000);
  const record = await tx.refreshToken.create({
    data: { userId, familyId, hashedToken: `pending:${randomUUID()}`, expiresAt },
  });
  const token = generateRefreshToken({ userId, tokenId: record.id });
  await tx.refreshToken.update({
    where: { id: record.id },
    data: { hashedToken: hashRefreshToken(token) },
  });
  return token;
};

export const createRefreshToken = async (userId: string) => {
  return prisma.$transaction(async (tx) =>
    createRefreshTokenRecord(tx, userId, randomUUID()),
  );
};

export const refresh = async (token: string) => {
  let payload: RefreshTokenPayload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError(401, "Invalid or expired refresh token");
  }
  if (!payload.userId || !Number.isInteger(payload.tokenId)) {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  const result = await prisma.$transaction(async (tx) => {
    const stored = await tx.refreshToken.findUnique({
      where: { id: payload.tokenId },
      include: { user: true },
    });
    if (!stored || stored.userId !== payload.userId || stored.hashedToken !== hashRefreshToken(token)) {
      return { error: "invalid" as const };
    }
    if (stored.revokedAt) {
      await tx.refreshToken.updateMany({
        where: { familyId: stored.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return { error: "revoked" as const };
    }
    if (stored.expiresAt <= new Date()) return { error: "expired" as const };

    const now = new Date();
    const claimed = await tx.refreshToken.updateMany({
      where: {
        id: stored.id,
        hashedToken: hashRefreshToken(token),
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: { revokedAt: now },
    });
    if (claimed.count !== 1) {
      await tx.refreshToken.updateMany({
        where: { familyId: stored.familyId, revokedAt: null },
        data: { revokedAt: now },
      });
      return { error: "revoked" as const };
    }

    const refresh_token = await createRefreshTokenRecord(tx, stored.userId, stored.familyId);
    return {
      access_token: generateAccessToken(stored.user.id, stored.user.user_role, stored.user.email),
      refresh_token,
    };
  });

  if ("error" in result) {
    throw new AppError(401, "Invalid or expired refresh token");
  }
  return result;
};

export const logout = async (token: string) => {
  let payload: RefreshTokenPayload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError(401, "Invalid or expired refresh token");
  }
  if (!payload.userId || !Number.isInteger(payload.tokenId)) {
    throw new AppError(401, "Invalid or expired refresh token");
  }
  const stored = await prisma.refreshToken.findUnique({ where: { id: payload.tokenId } });
  if (!stored || stored.userId !== payload.userId || stored.hashedToken !== hashRefreshToken(token)) {
    throw new AppError(401, "Invalid or expired refresh token");
  }
  await prisma.refreshToken.updateMany({
    where: { familyId: stored.familyId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

export const forgotPassword = async (email: string) => {
  const user = await authRepository.findUserByEmail(email.trim().toLowerCase());

  if (!user) {
    return;
  }

  const { token, hashedToken } = generateResetToken();

  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      reset_password_token: hashedToken,
      reset_password_token_expiry: expiry,
    },
  });

  const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (error) {
    console.error("Failed to send password reset email", error);
  }
};

export const resetPassword = async (token: string, password: string) => {
  const hashedToken = hashResetToken(token);

  const user = await authRepository.findUserByResetPasswordToken(hashedToken);

  if (!user) {
    throw new AppError(400, "Invalid or expired password reset link");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,

      //invalidate reset password token and expiry
      reset_password_token: null,
      reset_password_token_expiry: null,
    },
  });
};
