import Router from "express";
import { cListPermissions } from "../controllers/permission";

const router = Router();

router.get("/", cListPermissions);

export default router;
