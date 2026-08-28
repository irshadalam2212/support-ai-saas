import * as organizationRepository from "./organization.repository"

export const createOrganization = async (
    name: string,
    slug: string,
    userId: string
) => {
    const organization = await organizationRepository.createOrganization(
        name,
        slug,
        userId
    );
    return organization;
}