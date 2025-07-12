import { Router, Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { verifyAdmin } from "../middleware/auth";
const adminRouter = Router();
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

// --------------------- Admin Signup ---------------------
adminRouter.post("/signup", async (req: Request, res: Response) => {
  req.body.isAdmin = true;

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
      return res.status(400).json({ message: "Admin already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isAdmin: true,
      },
    });

    const token = jwt.sign(
      { userId: admin.id, isAdmin: true },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Admin signup successful",
      adminId: admin.id,
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --------------------- Admin Login ---------------------
adminRouter.post("/login", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation failed",
    //   errors: parsed.error.errors,
    });
  }

  const { email, password } = parsed.data;

  try {
    const admin = await prisma.user.findUnique({ where: { email } });

    if (!admin || !admin.isAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: admin.id, isAdmin: true },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Admin login successful",
      token,
      adminId: admin.id,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

adminRouter.get("/users", verifyAdmin, async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { isAdmin: false },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
      },
    });

    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});
  

adminRouter.patch("/user/:id/status", verifyAdmin, async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  const { isActive } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    res.json({ message: "User status updated", updated });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});



adminRouter.get("/user-reports", verifyAdmin, async (req, res) => {
  try {
    const reports = await prisma.userReport.findMany({
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reportedUser: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ reports });
  } catch (error) {
    console.error("Fetch reports error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default adminRouter;
