import prisma from "../../config/prisma"

export const createOrganization = async(
    name: string,
    slug: string,
    userId: string
) => {
    return prisma.$transaction(async(tx) => {
        const organization = await tx.organization.create({
            data: {
                name,
                slug
            }
        });

        await tx.organizationMember.create({
            data: {
                userId,
                organizationId: organization.id,
                role: "OWNER",
            }
        });
        return organization;
    });
}