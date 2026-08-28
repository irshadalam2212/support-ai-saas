import { Router } from "express";
import { createOrganization } from "./organization.controller";

const router = Router();

router.post("/", createOrganization);

export default router;