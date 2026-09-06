import bcrypt, { compare } from "bcrypt";
import * as authRepository from "./auth.repository";
import { AppError } from "../../utils/apperror";
import { LoginInput, RegisterInput } from "./auth.validation";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../../utils/jwt";
import prisma from "../../config/prisma";
import { randomUUID } from "crypto";

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

export const createRefreshToken = async (userId: string) => {
  const familyId = randomUUID();
  const expiresInDays = Number(process.env.REFRESH_TOKEN_EXPIRES_IN || 20);

  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const refreshTokenRecord = await prisma.refreshToken.create({
    data: {
      userId,
      familyId,
      hashedToken: "pending",
      expiresAt,
    },
  });

  const refreshToken = generateRefreshToken({
    userId,
    tokenId: refreshTokenRecord.id,
  });

  const tokenHash = hashRefreshToken(refreshToken);

  await prisma.refreshToken.update({
    where: {
      id: refreshTokenRecord.id,
    },
    data: {
      hashedToken: tokenHash,
    },
  });

  return refreshToken;
};

export const forgotPassword = async (email: string) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw new AppError(404, "User not registered");
  }

  
};
