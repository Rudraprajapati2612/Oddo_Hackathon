import http from "http";
import express from "express";
import dotenv from "dotenv";
import adminRouter from "./routes/admin";
import userRouter from "./routes/user";
import { setupWebSocketServer } from "./ws/index";
import cors from "cors"
dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
app.use(
  cors({
    origin: "http://localhost:8080", // Allow only your frontend
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true, // Allow cookies & authentication
  })
);
app.use(express.json());

app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);

// Attach WebSocket
setupWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
