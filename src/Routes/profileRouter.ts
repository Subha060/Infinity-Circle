import { Router } from "express";
import {
  getProfile,
  createProfile,
  updateProfile,
  changeAvater,
} from "../Controllers/handelProfile";
import { uploadAvatar } from "../Middleware/fileUploadMiddleware";

const router = Router();

router.get("/profile", getProfile); // api/user/profile
router.post("/createprofile", uploadAvatar, createProfile); // api/user/createprofile
router.put("/updateprofile", updateProfile); // api/user/updateprofile
router.patch("/changeavatar", uploadAvatar, changeAvater); // api/user/changeavatar

export default router;
