import { Router, Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { verifyUser } from "../middleware/auth";
const userRouter = Router();
const prisma = new PrismaClient();

// --------------------- Zod Schemas ---------------------
const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// --------------------- User Signup ---------------------
userRouter.post("/signup", async (req: Request, res: Response) => {
  req.body.isAdmin = false; // force isAdmin = false

  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation failed",
    //   errors: parsed.error.errors,
    });
  }

  const { name, email, password } = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isAdmin: false,
      },
    });

    const token = jwt.sign(
      { userId: user.id, isAdmin: false },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User signup successful",
      userId: user.id,
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --------------------- User Login ---------------------
userRouter.post("/login", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation failed",
    //   errors: parsed.error.errors,
    });
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isAdmin) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, isAdmin: false },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "User login successful",
      token,
      userId: user.id,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const profileSchema = z.object({
  bio: z.string().optional(),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  location: z.string().optional(),
});



userRouter.post("/profile", verifyUser, async (req, res) => {
  const result = profileSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
    });
  }

  const { bio, skills, location } = result.data;
  const userId = req.user!.userId;

  try {
    const existing = await prisma.profile.findUnique({ where: { userId } });
    if (existing) {
      return res.status(409).json({ message: "Profile already exists" });
    }

    const profile = await prisma.profile.create({
      data: {
        bio,
        location,
        userId,
        skills: {
          connectOrCreate: skills.map(skill => ({
            where: { name: skill },
            create: { name: skill }
          }))
        }
      },
      include: {
        skills: true, // Optional: include skills in response
      }
    });

    res.status(201).json({ message: "Profile created", profile });
  } catch (err) {
    console.error("Create profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


userRouter.get("/profile/me", verifyUser, async (req, res) => {
  const userId = req.user!.userId;

  try {
    const profile = await prisma.profile.findUnique({ where: { userId } });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ profile });
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


const requestSchema = z.object({
  toUserId: z.number(),
  skillNeeded: z.string().min(1),
  skillOffered: z.string().min(1),
  schedule: z.string().optional(),
});

userRouter.post("/request", verifyUser, async (req, res) => {
  const result = requestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: "Validation failed" });
  }

  const { toUserId, skillNeeded, skillOffered, schedule } = result.data;
  const fromUserId = req.user!.userId;

  try {
    if (toUserId === fromUserId) {
      return res.status(400).json({ message: "You can't request yourself." });
    }

    const toUserExists = await prisma.user.findUnique({
      where: { id: toUserId },
    });

    if (!toUserExists) {
      return res.status(404).json({ message: "Target user not found" });
    }

    const request = await prisma.swapRequest.create({
      data: {
        fromUserId,
        toUserId,
        skillNeeded,
        skillOffered,
        schedule,
      },
    });

    res.status(201).json({ message: "Swap request sent", request });
  } catch (err) {
    console.error("Swap request error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


userRouter.get("/requests/sent", verifyUser, async (req, res) => {
  const userId = req.user!.userId;

  try {
    const requests = await prisma.swapRequest.findMany({
      where: { fromUserId: userId },
      include: {
        toUser: {
          select: { id: true, email: true, name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({ requests });
  } catch (err) {
    console.error("Error fetching sent requests:", err);
    res.status(500).json({ message: "Server error" });
  }
});

userRouter.get("/requests/received", verifyUser, async (req, res) => {
  const userId = req.user!.userId;

  try {
    const requests = await prisma.swapRequest.findMany({
      where: { toUserId: userId },
      include: {
        fromUser: {
          select: { id: true, email: true, name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({ requests });
  } catch (err) {
    console.error("Error fetching received requests:", err);
    res.status(500).json({ message: "Server error" });
  }
});
const updateStatusSchema = z.object({
  status: z.enum(["accepted", "declined"])
});


userRouter.patch("/request/:id", verifyUser, async (req, res) => {
  const requestId = Number(req.params.id);
  const userId = req.user!.userId;

  const result = updateStatusSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid status. Must be 'accepted' or 'declined'." });
  }

  const { status } = result.data;

  try {
    const request = await prisma.swapRequest.findUnique({ where: { id: requestId } });

    if (!request) {
      return res.status(404).json({ message: "Swap request not found" });
    }

    if (request.toUserId !== userId) {
      return res.status(403).json({ message: "You are not authorized to update this request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already responded to" });
    }

    const updatedRequest = await prisma.swapRequest.update({
      where: { id: requestId },
      data: { status },
    });

    res.status(200).json({ message: `Request ${status}`, updatedRequest });
  } catch (err) {
    console.error("Error updating request status:", err);
    res.status(500).json({ message: "Server error" });
  }
});



userRouter.post("/report", verifyUser, async (req, res) => {
  const { reportedUserId, reason } = req.body;
  const reporterId = req.user!.userId;

  if (!reportedUserId || !reason) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    const report = await prisma.userReport.create({
      data: {
        reporterId,
        reportedUserId,
        reason,
      },
    });

    res.status(201).json({ message: "Report submitted", report });
  } catch (err) {
    console.error("Report error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default userRouter;
