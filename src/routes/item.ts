import Router from "express";

import cCreateItem from "../controllers/item/create";
import cGetItem from "../controllers/item/get";
import cListItems from "../controllers/item/list";
import cUpdateItem from "../controllers/item/update";

const router = Router();

router.post("/create", cCreateItem);
router.get("/:id", cGetItem);
router.post("/list", cListItems);
router.post("/update", cUpdateItem);

export default router;
