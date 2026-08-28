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
        select : {
            id: true,
            name: true,
            email: true,
            createdAt: true
        }
    })
}