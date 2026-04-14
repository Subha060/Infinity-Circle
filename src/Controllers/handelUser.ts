import { prisma } from "../../lib/prisma";
import type { Request, Response } from "express";
import hashingPassword from "../utils/hashingPassword";
import { createToken } from "../Auth/authToken";

export async function register(req: Request, res: Response) {
  const body = req.body as
    | {
        email?: string;
        phoneNo?: string;
        password?: string;
      }
    | undefined;

  if (!body) {
    return res.status(400).json({
      message:
        "Request body is missing. Send JSON with Content-Type: application/json.",
    });
  }

  const { email, phoneNo, password } = body;

  if (!email?.trim() || !phoneNo?.trim() || !password?.trim()) {
    return res.status(400).json({
      message: "Input field cannot be empty",
    });
  }

  try {
    const hashedPassword = await hashingPassword.generateHash(password);

    const user = await prisma.user.create({
      data: {
        email,
        phoneNo,
        password: hashedPassword,
      },
    });

    const token = createToken({
      id: user.id,
      email: user.email,
      phoneNo: user.phoneNo,
    });
    console.log(user);

    return res.status(201).json({ token });
  } catch (error: any) {
      // Prisma unique constraint error
      if (error.code === "P2002") {
        return res.status(409).json({
          message: "Email or phone number already exists",
        });
      }

      return res.status(500).json({
        message: "User creation failed",
      });
  }
}