import { Router } from "express";
import {
    register,
    login,
    refresh,
    logout
} from "./auth.controller";
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
} from "./auth.validation";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

router.post(
    "/register",
    validate(registerSchema),
    register
);

router.post(
    "/login",
    validate(loginSchema),
    login
);

router.post(
    "/refresh",
    validate(refreshTokenSchema),
    refresh
);

router.post(
    "/logout",
    validate(refreshTokenSchema),
    logout
);

export default router;
