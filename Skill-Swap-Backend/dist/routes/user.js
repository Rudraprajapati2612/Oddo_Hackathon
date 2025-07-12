"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const userRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const notification_1 = require("../ws/notification");
// --------------------- Zod Schemas ---------------------
const signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    email: zod_1.z.string().email("Invalid email"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
// --------------------- User Signup ---------------------
userRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                isAdmin: false,
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, isAdmin: false }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(201).json({
            message: "User signup successful",
            userId: user.id,
            token,
        });
    }
    catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
// --------------------- User Login ---------------------
userRouter.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Validation failed",
            //   errors: parsed.error.errors,
        });
    }
    const { email, password } = parsed.data;
    try {
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user || user.isAdmin) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, isAdmin: false }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).json({
            message: "User login successful",
            token,
            userId: user.id,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
const profileSchema = zod_1.z.object({
    bio: zod_1.z.string().optional(),
    skills: zod_1.z.array(zod_1.z.string()).min(1, "At least one skill is required"),
    location: zod_1.z.string().optional(),
});
userRouter.post("/profile", auth_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = profileSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            message: "Validation failed",
        });
    }
    const { bio, skills, location } = result.data;
    const userId = req.user.userId;
    try {
        const existing = yield prisma.profile.findUnique({ where: { userId } });
        if (existing) {
            return res.status(409).json({ message: "Profile already exists" });
        }
        const profile = yield prisma.profile.create({
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
    }
    catch (err) {
        console.error("Create profile error:", err);
        res.status(500).json({ message: "Server error" });
    }
}));
userRouter.get("/profile/me", auth_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    try {
        const profile = yield prisma.profile.findUnique({ where: { userId } });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        res.status(200).json({ profile });
    }
    catch (err) {
        console.error("Fetch profile error:", err);
        res.status(500).json({ message: "Server error" });
    }
}));
const requestSchema = zod_1.z.object({
    toUserId: zod_1.z.number(),
    skillNeeded: zod_1.z.string().min(1),
    skillOffered: zod_1.z.string().min(1),
    schedule: zod_1.z.string().optional(),
});
userRouter.post("/request", auth_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = requestSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: "Validation failed" });
    }
    const { toUserId, skillNeeded, skillOffered, schedule } = result.data;
    const fromUserId = req.user.userId;
    try {
        if (toUserId === fromUserId) {
            return res.status(400).json({ message: "You can't request yourself." });
        }
        const toUserExists = yield prisma.user.findUnique({
            where: { id: toUserId },
        });
        if (!toUserExists) {
            return res.status(404).json({ message: "Target user not found" });
        }
        const request = yield prisma.swapRequest.create({
            data: {
                fromUserId,
                toUserId,
                skillNeeded,
                skillOffered,
                schedule,
            },
        });
        yield (0, notification_1.notifyUser)({
            userId: toUserId,
            message: `You have a new swap request from ${req.user.userId}`,
            type: "swap-request"
        });
        res.status(201).json({ message: "Swap request sent", request });
    }
    catch (err) {
        console.error("Swap request error:", err);
        res.status(500).json({ message: "Server error" });
    }
}));
userRouter.get("/requests/sent", auth_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    try {
        const requests = yield prisma.swapRequest.findMany({
            where: { fromUserId: userId },
            include: {
                toUser: {
                    select: { id: true, email: true, name: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        res.status(200).json({ requests });
    }
    catch (err) {
        console.error("Error fetching sent requests:", err);
        res.status(500).json({ message: "Server error" });
    }
}));
userRouter.get("/requests/received", auth_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    try {
        const requests = yield prisma.swapRequest.findMany({
            where: { toUserId: userId },
            include: {
                fromUser: {
                    select: { id: true, email: true, name: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        res.status(200).json({ requests });
    }
    catch (err) {
        console.error("Error fetching received requests:", err);
        res.status(500).json({ message: "Server error" });
    }
}));
const updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["accepted", "declined"])
});
userRouter.patch("/request/:id", auth_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requestId = Number(req.params.id);
    const userId = req.user.userId;
    const result = updateStatusSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: "Invalid status. Must be 'accepted' or 'declined'." });
    }
    const { status } = result.data;
    try {
        const request = yield prisma.swapRequest.findUnique({ where: { id: requestId } });
        if (!request) {
            return res.status(404).json({ message: "Swap request not found" });
        }
        if (request.toUserId !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this request" });
        }
        if (request.status !== "pending") {
            return res.status(400).json({ message: "Request already responded to" });
        }
        const updatedRequest = yield prisma.swapRequest.update({
            where: { id: requestId },
            data: { status },
        });
        yield (0, notification_1.notifyUser)({
            userId: request.fromUserId,
            message: `Your swap request has been ${status} by user ${userId}`,
            type: "swap-response"
        });
        res.status(200).json({ message: `Request ${status}`, updatedRequest });
    }
    catch (err) {
        console.error("Error updating request status:", err);
        res.status(500).json({ message: "Server error" });
    }
}));
userRouter.post("/report", auth_1.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reportedUserId, reason } = req.body;
    const reporterId = req.user.userId;
    if (!reportedUserId || !reason) {
        return res.status(400).json({ message: "Invalid input" });
    }
    try {
        const report = yield prisma.userReport.create({
            data: {
                reporterId,
                reportedUserId,
                reason,
            },
        });
        res.status(201).json({ message: "Report submitted", report });
    }
    catch (err) {
        console.error("Report error:", err);
        res.status(500).json({ message: "Server error" });
    }
}));
exports.default = userRouter;
