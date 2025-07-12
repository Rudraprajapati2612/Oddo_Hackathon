import express from "express";
import dotenv from "dotenv";
import adminRouter from "./routes/admin";
import userRouter from "./routes/user";

dotenv.config(); // Load .env

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
// app.get("/", (req, res) => {
//   res.send("Skill Swap API running ✅");
// });

// Routes
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
