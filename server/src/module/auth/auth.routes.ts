import { Router } from "express";
import {
  forgotPasswordController,
  loginController,
  logoutController,
  refreshController,
  registerController,
  resetPasswordController,
} from "./auth.controller";
import {
  forgotPasswordRequestSchema,
  loginSchema,
  registerSchema,
  resetPasswordRequestSchema,
  refreshTokenSchema,
} from "./auth.validation";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

router.post("/register", validate(registerSchema), registerController);

router.post("/login", validate(loginSchema), loginController);

router.post("/refresh", validate(refreshTokenSchema), refreshController);

router.post("/logout", validate(refreshTokenSchema), logoutController);

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
