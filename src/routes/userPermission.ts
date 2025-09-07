import Router from "express";

import { cSetUP, cGetUP } from "../controllers/userPermission";

const router = Router();

router.put("/set", cSetUP);
router.get("/:userId", cGetUP);

export default router;
