import bcrypt, { compare } from 'bcrypt';
import * as authRepository from "./auth.repository"
import { generateAccessToken } from '../../utils/jwt';
import { generateRefreshToken, hashRefreshToken } from '../../utils/refresh-token';

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
  const refreshTokenExpiresAt = new Date();
  refreshTokenExpiresAt.setDate(
    refreshTokenExpiresAt.getDate() + 30
  )

  await authRepository.createRefreshToken(
    user.id,
    refreshTokenHash,
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
