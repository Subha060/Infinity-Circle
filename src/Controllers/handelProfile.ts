import { prisma } from "../../lib/prisma.ts";
import type { Request, Response } from "express";

// Prisma schema for reference
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

// Get the profile of the authenticated user
export async function getProfile(req: Request, res: Response) {
  const userId = req.user?.id;

  if (!userId || typeof userId !== "string") {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  try {
    const userProfile = await prisma.profile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

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

// Create a new profile for the authenticated user
export async function createProfile(req: Request, res: Response) {
  const userId = req.user?.id;
  const { first_name, last_name, dob, bio } = req.body as {
    first_name: string;
    last_name: string;
    dob: string;
    bio?: string;
  };

  // file upload handling
  const file = req.file; // <-- multer file

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

    // file url from multer
    const fileUrl = file ? `/uploads/${userId}/avatar/${file.filename}` : null;
    // avatar: file? file.path : null,

    const userProfile = await prisma.profile.create({
      data: {
        avatar: fileUrl, // Save file path if uploaded
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        dob: dobDate,
        bio: bio?.trim() ?? null,
        user: {
          connect: { id: userId }, // link profile to user
        },
      },
      include: {
        user: {
          select: {
            email: true,
            phoneNo: true,
          },
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

// Update an existing profile for the authenticated user
export async function updateProfile(req: Request, res: Response) {
  const userId = req.user?.id;
  const { first_name, last_name, dob, bio } = req.body as {
    first_name?: string;
    last_name?: string;
    dob?: string;
    bio?: string;
  };

  try {
    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Check if at least one field is provided for update
    if (
      !first_name?.trim() &&
      !last_name?.trim() &&
      !dob &&
      (bio === undefined || bio.trim() === "")
    ) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    // Validate date format if provided
    let dobDate: Date | undefined;
    if (dob) {
      dobDate = new Date(dob);
      if (isNaN(dobDate.getTime())) {
        return res
          .status(400)
          .json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }
    }

    // Age verification if dob is being updated
    if (dobDate) {
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
    }

    // Update only the fields that are provided, otherwise keep existing values
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        first_name: first_name?.trim() ?? existingProfile.first_name,
        last_name: last_name?.trim() ?? existingProfile.last_name,
        dob: dobDate ?? existingProfile.dob,
        bio: bio?.trim() ?? existingProfile.bio,
      },
      include: {
        user: {
          select: {
            email: true,
            phoneNo: true,
          },
        },
      },
    });

    // Return the updated profile data
    return res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// change avater of the user
export async function changeAvater(req: Request, res: Response) {
  const userId = req.user?.id;

  if (!userId || typeof userId !== "string") {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  try {
    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // file upload handling
    const file = req.file; // <-- multer file

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // file url from multer
    const fileUrl = `/uploads/${userId}/avatar/${file.filename}`;

    // Update the avatar field in the profile
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        avatar: fileUrl,
      },
      include: {
        user: {
          select: {
            email: true,
            phoneNo: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Avatar updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Change avatar error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
