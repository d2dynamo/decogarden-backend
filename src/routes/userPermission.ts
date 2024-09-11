import Router from "express";

import { cSetUP, cListUP } from "../controllers/userPermission";

const router = Router();

router.put("/set", cSetUP);
router.get("/list/:id", cListUP);

export default router;
