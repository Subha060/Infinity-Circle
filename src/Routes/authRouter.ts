import { Router } from "express";
import { register } from "../Controllers/handelUser";

const router = Router();

router.post("/register", register);

export default router;
