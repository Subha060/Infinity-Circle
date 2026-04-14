import { prisma } from "../../lib/prisma";
import type { Request, Response } from "express";
import hashingPassword from "../utils/hashingPassword";
import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?:
        | {
            id: string;
            email: string;
            phoneNo: string;
          }
        | JwtPayload;
    }
  }
}

export async function changePassword(req: Request, res: Response) {
  const user = req.user;

  if (!user || typeof user === "string") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = user;

  const { oldPassword, newPassword } = req.body as {
    oldPassword: string;
    newPassword: string;
  };
  if (!oldPassword?.trim() || !newPassword?.trim()) {
    return res.status(400).json({
      message: "Old and new password are required",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        message: "User does not exist",
      });
    }

    const verifyUser = await hashingPassword.verifyPassword(
      oldPassword,
      user.password,
    );

    if (!verifyUser) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Optional: prevent same password reuse
    const isSamePassword = await hashingPassword.verifyPassword(
      newPassword,
      user.password,
    );

    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different",
      });
    }

    const hashedPassword = await hashingPassword.generateHash(newPassword);

    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch {
    return res.status(500).json({
      message: "Something went wrong while changing password",
    });
  }
}
