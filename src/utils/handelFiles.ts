import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import type { Request } from "express";

type DestType = "avatar" | "story" | "post";

function saveFile(req: Request, dest: DestType) {
  const userId = req.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const allowedTypes: Record<DestType, string[]> = {
    avatar: ["image/jpeg", "image/png", "image/webp"],
    story: ["image/jpeg", "image/png", "video/mp4"],
    post: ["image/jpeg", "image/png", "video/mp4"],
  };

  const storage = multer.diskStorage({
    destination(req, file, cb) {
      const dir = `./uploads/${userId}/${dest}`;
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },

    filename(req, file, cb) {
      const ext = path.extname(file.originalname);

      if (dest === "avatar") {
        return cb(null, `avatar-${userId}${ext}`);
      }

      if (dest === "story") {
        return cb(null, `story-${Date.now()}${ext}`);
      }

      if (dest === "post") {
        return cb(null, `post-${Date.now()}${ext}`);
      }
    },
  });

  const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
    if (!allowedTypes[dest].includes(file.mimetype)) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,

    // limits the filesize to 2MB for avatar and 20MB for story/post but its currently disabled for testing purpose, you can enable it by uncommenting the below code and commenting the above line
    // limits: {
    //   fileSize:
    //     dest === "avatar"
    //       ? 2 * 1024 * 1024 // 2MB
    //       : 20 * 1024 * 1024, // 20MB for story/post
    // },
  });
}

export default saveFile;
