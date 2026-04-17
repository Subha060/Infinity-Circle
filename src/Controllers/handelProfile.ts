import { prisma } from "../../lib/prisma.ts";
import type { Request, Response } from "express";

// model Profile {
//   id         String   @id @default(cuid())
//   avatar     String?
//   first_name String
//   last_name  String
//   dob        DateTime?
//   bio        String?
//   createdAt  DateTime @default(now())

//   user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
//   userId String @unique
// }

export async function getProfile(req: Request, res: Response) {
  const userId = req.user?.id;

  try {
    const userProfile = await prisma.profile.findUnique({
      where: {
        userId: userId,
      },
    });

    return res.status(200).json({
      message: "Profile data retrieved successfully",
      profile: userProfile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      message: "Failed to retrieve profile data",
    });
  }
}

export async function createProfile(req: Request, res: Response) {
  const userId = req.user?.id;
  const { first_name, last_name, dob, bio } = req.body as {
    first_name: string;
    last_name: string;
    dob: string;
    bio?: string;
  };

  // Check required fields
  if (!first_name?.trim() || !last_name?.trim()) {
    return res.status(400).json({ message: "Field cannot be empty" });
  }

  if (!dob) {
    return res.status(400).json({ message: "Date of birth is required" });
  }

  // Validate date format
  const dobDate = new Date(dob);
  if (isNaN(dobDate.getTime())) {
    return res
      .status(400)
      .json({ message: "Invalid date format. Use YYYY-MM-DD" });
  }

  // Age verification
  const today = new Date();
  let age = today.getFullYear() - dobDate.getFullYear();
  const monthDiff = today.getMonth() - dobDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dobDate.getDate())
  ) {
    age--;
  }
  if (age < 13) {
    return res
      .status(403)
      .json({ message: "You must be at least 13 years old to register." });
  }

  try {
    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return res.status(409).json({ message: "Profile already exists" });
    }

    const userProfile = await prisma.profile.create({
      data: {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        dob: dobDate,
        bio: bio?.trim() ?? null,
        user: {
          connect: { id: userId }, // link profile to user
        },
      },
    });

    return res.status(201).json({
      message: "Profile created successfully",
      profile: userProfile,
    });
  } catch (error) {
    console.error("Create profile error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
