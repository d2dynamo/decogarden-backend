import Router from "express";

import passport from "../modules/passport";
import { loginUserWithEmail } from "../controllers/auth/local";
const router = Router();

router.post("/local", passport.authenticate("local"), loginUserWithEmail);

export default router;
