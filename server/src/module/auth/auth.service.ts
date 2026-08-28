import bcrypt, { compare } from 'bcrypt';
import * as authRepository from "./auth.repository"
import { generateAccessToken } from '../../utils/jwt';
import { generateRefreshToken, generateTokenFamily, hashRefreshToken } from '../../utils/refresh-token';

export const register = async (
  name: string,
  email: string,
  password: string
) => {

  const existingUser = await authRepository.findUserByEmail(email);

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await authRepository.createUser(name, email, passwordHash);

  return user;
};

export const login = async (
  email: string,
  password: string
) => {
  const user = await authRepository.findUserByEmail(email)

  if (!user) {
    throw new Error("Invalid email or password.")
  }

  const matchedPassword = await bcrypt.compare(
    password,
    user.passwordHash
  )

  if (!matchedPassword) {
    throw new Error("Invalid email or password.")
  }

  const accessToken = generateAccessToken({ userId: user.id })
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken)
  const tokenFamily = generateTokenFamily();
  const refreshTokenExpiresAt = new Date();
  refreshTokenExpiresAt.setDate(
    refreshTokenExpiresAt.getDate() + 30
  )

  await authRepository.createRefreshToken(
    user.id,
    refreshTokenHash,
    tokenFamily,
    refreshTokenExpiresAt
  )

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  }
}

export const refreshAccessToken = async (refreshToken: string) => {

  const tokenHash = hashRefreshToken(refreshToken);

  const storedToken = await authRepository.findRefreshToken(tokenHash);

  if (!storedToken) {
    throw new Error("Invalid refresh token");
  }

  if (storedToken.revokedAt) {
    throw new Error("Refresh token has been revoked");
  }

  if (storedToken.expiresAt < new Date()) {
    throw new Error("Refresh token has expired");
  }

  // Revoke old token
  if (storedToken.revokedAt) {
    await authRepository.revokeTokenFamily(
      storedToken.tokenFamily
    );

    throw new Error("Refresh token reuse detected");
  }

  // Generate replacement
  const newRefreshToken = generateRefreshToken();

  const newRefreshTokenHash =
    hashRefreshToken(newRefreshToken);

  const newExpiresAt = new Date();

  newExpiresAt.setDate(
    newExpiresAt.getDate() + 30
  );


  await authRepository.createRefreshToken(
    storedToken.userId,
    newRefreshTokenHash,
    storedToken.tokenFamily,
    newExpiresAt
  );

  const accessToken = generateAccessToken({
    userId: storedToken.userId,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  }
}

export const logout = async (
  refreshToken: string
) => {
  const tokenHash = hashRefreshToken(refreshToken);

  const storedToken = await authRepository.findRefreshToken(tokenHash);

  if (!storedToken) {
    return
  }

  await authRepository.revokeTokenFamily(storedToken.id)
}