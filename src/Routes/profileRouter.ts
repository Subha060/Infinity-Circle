import { Router } from "express";
import { getProfile, createProfile } from "../Controllers/handelProfile.ts";

const router = Router();

router.get("/profile", getProfile); // api/user/profile
router.post("/createprofile", createProfile); // api/user/createprofile

export default router;
