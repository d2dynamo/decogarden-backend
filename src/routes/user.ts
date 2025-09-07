import { Router } from "express";
import {
  createUserController,
  enable2faController,
  generate2faController,
  listUsersController,
  getUserController,
  getUserBasicController,
  updateUserController,
  archiveUserController,
} from "controllers/user";

const router = Router();

router.post("/create", createUserController);
router.get("/:id", getUserController);
router.get("/:id/basic", getUserBasicController);
router.get("/list", listUsersController);
router.post("/gen2fa", generate2faController);
router.post("/enable2fa", enable2faController);
router.post("/update", updateUserController);
router.post("/archive", archiveUserController);

export default router;
