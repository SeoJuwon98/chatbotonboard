import "dotenv/config";
import express from "express";
import cors from "cors";
import { sessionsRouter } from "./routes/sessions.js";
import { messagesRouter } from "./routes/messages.js";
import chatStreamRouter from "./routes/chat-stream.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// ─── Routes ───
app.use("/sessions", sessionsRouter);
app.use("/v1", chatStreamRouter);
app.use("/chat", messagesRouter);

// ─── Health check ───
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
