import { Router } from "express";
import { loginController, registerController } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

router.post("/register", validate(registerSchema), registerController);

router.post("/login", validate(loginSchema), loginController);

export default router;
