import prisma from "../../config/prisma";
import { RegisterInput } from "./auth.validation";

export const findUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  return user;
};

export const createUser = async (body: RegisterInput) => {
  return prisma.user.create({
    data: body,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });
};

export const findUserByResetPasswordToken = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: {
      reset_password_token: token,
      reset_password_token_expiry: { gt: new Date() },
    },
  });
  return user;
};
