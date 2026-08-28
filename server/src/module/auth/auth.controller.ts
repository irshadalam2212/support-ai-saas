import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    const user = await authService.register(
      name,
      email,
      password
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body

    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      code: 200,
      message: "Login successfull.",
      data: result
    })
  } catch (error) {
    next(error)
  }
}