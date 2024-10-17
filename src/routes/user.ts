import { Router } from "express";
import cCreateUser from "../controllers/user/create";
import { cVerifyEmail } from "../controllers/user/verify";

const router = Router();

router.post("/create", cCreateUser);
router.post("/verify/email", cVerifyEmail);

export default router;
