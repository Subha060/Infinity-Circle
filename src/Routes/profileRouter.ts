import { Router } from "express";
import {
  getProfile,
  createProfile,
  updateProfile,
} from "../Controllers/handelProfile.ts";

const router = Router();

router.get("/profile", getProfile); // api/user/profile
router.post("/createprofile", createProfile); // api/user/createprofile
router.put("/updateprofile", updateProfile); // api/user/updateprofile

export default router;
