import { Router } from "express";
import { changePassword } from "../Controllers/updateUser";

const router = Router();

router.post("/changepassword", changePassword);

export default router;
