import Router from "express";
import getHello from "../controllers/hello/get";

const router = Router();

router.get("/", getHello);

export default router;
