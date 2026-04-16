import { prisma } from "../../lib/prisma";
import type { Request, Response } from "express";
import hashingPassword from "../utils/hashingPassword";

export async function changePassword(req: Request, res: Response) {
  const id: string = req.user?.id;

  if (!id || typeof id !== "string") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { oldPassword, newPassword } = req.body as {
    oldPassword: string;
    newPassword: string;
  };
  if (!oldPassword?.trim() || !newPassword?.trim()) {
    return res.status(400).json({
      message: `${!oldPassword.trim() ? "Old" : "New"} password are required`,
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
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while changing password",
    });
  }
}

// Changing email or phone
export async function chnagecontact(req: Request, res: Response) {
  const id: string = req.user?.id;
  const { phoneNo, email, password } = req.body as {
    phoneNo: string;
    email: string;
    password: string;
  };

  if (!phoneNo?.trim()) {
    return res.status(400).json({ message: "Phone number is missing" });
  }

  if (!email?.trim()) {
    return res.status(400).json({ message: "Email is missing" });
  }

  if (!password?.trim()) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const verifyUser = await hashingPassword.verifyPassword(
      password,
      user.password,
    );

    if (!verifyUser) {
      return res.status(401).json({ message: "Wrong password" });
    }

    if (phoneNo === user.phoneNo && email === user.email) {
      return res.status(400).json({
        message: "New details must be different",
      });
    }

    // Build update object
    const updateData: any = {};
    const conditions: any[] = [];

    if (phoneNo !== user.phoneNo) {
      updateData.phoneNo = phoneNo;
      conditions.push({ phoneNo });
    }

    if (email !== user.email) {
      updateData.email = email;
      conditions.push({ email });
    }

    // Check uniqueness (only if something changed)
    if (conditions.length > 0) {
      const existing = await prisma.user.findFirst({
        where: {
          OR: conditions,
          NOT: { id: user.id },
        },
      });

      if (existing) {
        if (existing.email === email) {
          return res.status(400).json({
            message: "Email already in use",
          });
        }

        if (existing.phoneNo === phoneNo) {
          return res.status(400).json({
            message: "Phone number already in use",
          });
        }
      }
    }

    // ✅ Always run update if changes exist
    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return res.status(200).json({
      message: "Updated successfully",
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0];
      return res.status(400).json({
        message: `${field} already in use`,
      });
    }

    return res.status(500).json({
      message: "Something went wrong while changing contact details",
    });
  }
}