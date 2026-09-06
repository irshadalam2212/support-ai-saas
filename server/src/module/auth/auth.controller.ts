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

export const forgotPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    await authService.forgotPassword(email);

    return res.status(200).json({
      success: true,
      message:
        "If an account exists for this email, a password reset link has been sent.",
    });
  },
);

export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully.",
    });
  },
);
