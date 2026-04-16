import { Router } from "express";
import { changePassword, chnagecontact } from "../Controllers/updateUser";

const router = Router();

router.post("/updatepassword", changePassword);
router.post("/updatephoneno", chnagecontact);

export default router;
