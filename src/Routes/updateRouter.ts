import { Router } from "express";
import { changePassword, chnageContact } from "../Controllers/updateUser";

const router = Router();

router.post("/updatepassword", changePassword); // api/user/updatepassword
router.post("/updatecontact", chnageContact); // api/user/updatecontact

export default router;
