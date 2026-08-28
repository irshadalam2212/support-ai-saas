import bcrypt from 'bcrypt';
import * as authRepository from "./auth.repository"
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";

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
