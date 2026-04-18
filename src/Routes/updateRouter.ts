import { Router } from "express";
import { changePassword, chnageContact } from "../Controllers/updateUser";

const router = Router();

router.post("/updatepassword", changePassword); // api/user/updatepassword
router.post("/updatecontact", chnageContact); // api/user/updatecontact

//  currently there is problem in the update contact route that need to be fixed that when user updated the contact details the they did not get the updated details in the response and they need to make another request to get the updated details which is not good for user experience

export default router;
