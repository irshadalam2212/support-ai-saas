import { Request, Response, NextFunction } from "express";
import * as organizationService from "./organization.service";

export const createOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, slug } = req.body;

    // Temporary user ID
    const userId = req.user!.id;

    const organization =
      await organizationService.createOrganization(
        name,
        slug,
        userId
      );

    res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};