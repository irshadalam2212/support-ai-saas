import { Router } from "express";
import {
  forgotPasswordController,
  loginController,
  registerController,
  resetPasswordController,
} from "./auth.controller";
import {
  forgotPasswordRequestSchema,
  loginSchema,
  registerSchema,
  resetPasswordRequestSchema,
} from "./auth.validation";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

router.post("/register", validate(registerSchema), registerController);

router.post("/login", validate(loginSchema), loginController);

router.post(
  "/forgot-password",
  validate(forgotPasswordRequestSchema),
  forgotPasswordController,
);

router.post(
  "/reset-password",
  validate(resetPasswordRequestSchema),
  resetPasswordController,
);

export default router;
