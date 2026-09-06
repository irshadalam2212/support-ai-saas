import bcrypt, { compare } from "bcrypt";
import * as authRepository from "./auth.repository";
import { AppError } from "../../utils/apperror";
import { LoginInput, RegisterInput } from "./auth.validation";

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
  const existingUser = await authRepository.findUserByEmail(email);

  if (!existingUser) {
    throw new AppError(404, "User not registered");
  }

  const isPasswordMatch = await bcrypt.compare(
    body.password,
    existingUser.password,
  );

  if (!isPasswordMatch) {
    throw new AppError(401, "Invalid email or password");
  }

  return {
    id: existingUser.id,
    name: existingUser.name,
    email: existingUser.email,
  };
};
