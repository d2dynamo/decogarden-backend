import Router from "express";

import passport from "../modules/passport";
import { loginUserWithEmail, refreshTokens } from "../controllers/auth/local";
import { cVerifyEmail } from "../controllers/auth/verify";

const router = Router();

router.post("/verify/email", cVerifyEmail);

router.get("/refreshTokens", refreshTokens);

router.post("/local", passport.authenticate("local"), loginUserWithEmail);

export default router;
