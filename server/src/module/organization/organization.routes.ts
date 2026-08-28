import { Router } from "express";
import { createOrganization } from "./organization.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createOrganization);

export default router;