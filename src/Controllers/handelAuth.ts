import { prisma } from "../../lib/prisma";
import type { Request, Response } from "express";
import HashingPassword from "../utils/hashingPassword";
import { createToken } from "../Auth/authToken";

//user register
export async function register(req: Request, res: Response) {
  const body = req.body as
    | {
        email?: string;
        phoneNo?: string;
        password: string;
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
    const hashedPassword = await HashingPassword.generateHash(password);

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

    return res.status(201).json({
      message: "Registration successful",
      token,
    });
  } catch (error: any) {
    // Prisma unique constraint error
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    return res.status(500).json({
      message: "User creation failed",
    });
  }
}

// login
export async function login(req: Request, res: Response) {
  const body = req.body as
    | {
        username: string;
        password: string;
      }
    | undefined;

  if (!body) {
    return res.status(400).json({
      message:
        "Request body is missing. Send JSON with Content-Type: application/json.",
    });
  }

  const { username, password } = body;

  if (!username?.trim() || !password?.trim()) {
    return res.status(400).json({
      message: "Username and password are required",
    });
  }

  try {
    const isEmail = username.includes("@");

    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: username.toLowerCase() }
        : { phoneNo: username },
    });

    // ✅ Avoid user enumeration
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const verifyUser = await HashingPassword.verifyPassword(
      password,
      user.password,
    );

    if (!verifyUser) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      phoneNo: user.phoneNo,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch {
    return res.status(500).json({
      message: "Login failed",
    });
  }
}
