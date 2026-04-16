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

// change phone number of email
export async function changePhoneNo(req: Request, res: Response) {
  const id: string = req.user?.id;
  const { phoneNo, email, password } = req.body as {
    phoneNo: string;
    email: string;
    password: string;
  };

  if (!phoneNo.trim()) {
    return res.status(400).json({
      message: "New phone number is required",
    });
  }

  if (!password.trim()) {
    return res.status(400).json({
      message: "Password is required",
    });
  }

  // const isExists = await prisma.user.findUnique({
  //   where: {
  //     phoneNo: phoneNo,
  //   },
  // });

  // if (isExists) {
  //   return res.status(409).json({
  //     message: "Phone number already in use"
  //   })
  // }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const verifyUser = await hashingPassword.verifyPassword(
      password,
      user.password,
    );

    if (!verifyUser) {
      return res.status(401).json({
        message: "Wrong password",
      });
    }

    if (phoneNo === user.phoneNo) {
      return res.status(400).json({
        message: "New phone number must be different",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneNo: phoneNo,
      },
    });

    return res.status(200).json({
      message: "Phone number updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while changing password",
    });
  }
}
