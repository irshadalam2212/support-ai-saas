import { Request, Response } from "express";
import * as authService from "./auth.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
      },
    });
  },
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: "User logged in",
      data: user,
    });
  },
);
