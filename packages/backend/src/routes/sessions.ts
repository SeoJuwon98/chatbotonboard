import { Router } from "express";
import { prisma } from "../lib/db.js";
import type {
  CreateSessionRequest,
  ChatSession,
  ChatModelId,
} from "@chatbot/shared";

export const sessionsRouter = Router();

/** GET /sessions — 채팅 목록 (최신순) */
sessionsRouter.get("/", async (_req, res) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        model: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const result: ChatSession[] = sessions.map((s) => ({
      id: s.id,
      title: s.title,
      model: s.model as ChatModelId,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));

    res.json(result);
  } catch (error) {
    console.error("GET /sessions error:", error);
    res.status(500).json({ error: "채팅 목록 조회 실패" });
  }
});

/** POST /sessions — 새 세션 생성 */
sessionsRouter.post("/", async (req, res) => {
  try {
    const body = req.body as CreateSessionRequest;

    const session = await prisma.chatSession.create({
      data: {
        ...(body.id ? { id: body.id } : {}),
        title: body.title ?? "새로운 채팅",
        model: body.model,
      },
    });

    const result: ChatSession = {
      id: session.id,
      title: session.title,
      model: session.model as ChatModelId,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };

    res.status(201).json({ session: result });
  } catch (error) {
    console.error("POST /sessions error:", error);
    res.status(500).json({ error: "세션 생성 실패" });
  }
});

/** DELETE /sessions/:id — 세션 삭제 (cascade로 메시지도 삭제) */
sessionsRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.chatSession.delete({
      where: { id: req.params.id },
    });
    res.status(204).end();
  } catch (error) {
    console.error("DELETE /sessions/:id error:", error);
    res.status(500).json({ error: "세션 삭제 실패" });
  }
});
