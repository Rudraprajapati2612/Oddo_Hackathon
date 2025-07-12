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
const adminRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
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
// --------------------- Admin Signup ---------------------
adminRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Admin already exists with this email" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const admin = yield prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                isAdmin: true,
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: admin.id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(201).json({
            message: "Admin signup successful",
            adminId: admin.id,
            token,
        });
    }
    catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
// --------------------- Admin Login ---------------------
adminRouter.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Validation failed",
            //   errors: parsed.error.errors,
        });
    }
    const { email, password } = parsed.data;
    try {
        const admin = yield prisma.user.findUnique({ where: { email } });
        if (!admin || !admin.isAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        const isMatch = yield bcrypt_1.default.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: admin.id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).json({
            message: "Admin login successful",
            token,
            adminId: admin.id,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = adminRouter;
