import { Router } from "express";
import cCreateUser from "../controllers/user/create";

const router = Router();

router.post("/create", cCreateUser);
