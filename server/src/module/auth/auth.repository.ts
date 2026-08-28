import prisma from "../../config/prisma"

export const findUserByEmail = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })
    return user;
}

export const createUser = async (
    name: string,
    email: string,
    passwordHash: string
) => {
    return prisma.user.create({
        data: {
            name,
            email,
            passwordHash
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
        }
    })
}

export const createRefreshToken = async (
    userId: string,
    tokenHash: string,
    tokenFamily: string,
    expiresAt: Date
) => {
    return prisma.refreshToken.create({
        data: {
            userId,
            tokenHash,
            tokenFamily,
            expiresAt
        }
    })
}

export const findRefreshToken = async (tokenHash: string) => {
    return prisma.refreshToken.findUnique({
        where: {
            tokenHash
        }
    })
}

export const revokeTokenFamily = async (
  tokenFamily: string
) => {
  return prisma.refreshToken.updateMany({
    where: {
      tokenFamily,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};