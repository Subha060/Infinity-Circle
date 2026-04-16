import { Router } from "express";
import { changePassword, changePhoneNo } from "../Controllers/updateUser";

const router = Router();

router.post("/updatepassword", changePassword);
router.post("/updatephoneno", changePhoneNo);

export default router;
