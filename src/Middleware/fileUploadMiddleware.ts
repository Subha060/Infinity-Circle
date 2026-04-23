import type { Request, Response, NextFunction } from "express";
import saveFile from "../utils/handelFiles";

export const uploadAvatar = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const upload = saveFile(req, "avatar").single("avatar");

  upload(req, res, function (err) {
    if (err) {
      console.log(err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// export const uploadStory = (req: Request, res: Response, next: NextFunction) {
//     const upload =
// }
