import { Router } from "express";
import { prisma } from "../lib/db.js";
export const messagesRouter = Router();
/** GET /chat/:streamId/messages — 메시지 목록 조회 */
messagesRouter.get("/:streamId/messages", async (req, res) => {
    try {
        const { streamId } = req.params;
        const messages = await prisma.message.findMany({
            where: { streamId },
            orderBy: { orderIndex: "asc" },
        });
        const result = messages.map((m) => ({
            id: m.id,
            streamId: m.streamId,
            role: m.role,
            content: m.content,
            reasoningContent: m.reasoningContent,
            images: m.images,
            orderIndex: m.orderIndex,
            createdAt: m.createdAt.toISOString(),
        }));
        res.json(result);
    }
    catch (error) {
        console.error("GET /chat/:streamId/messages error:", error);
        res.status(500).json({ error: "메시지 조회 실패" });
    }
});
/** POST /chat/:streamId/messages — 메시지 저장 */
messagesRouter.post("/:streamId/messages", async (req, res) => {
    try {
        const { streamId } = req.params;
        const body = req.body;
        // 다음 orderIndex 계산
        const lastMessage = await prisma.message.findFirst({
            where: { streamId },
            orderBy: { orderIndex: "desc" },
            select: { orderIndex: true },
        });
        const nextOrder = (lastMessage?.orderIndex ?? -1) + 1;
        const message = await prisma.message.create({
            data: {
                streamId,
                role: body.role,
                content: body.content,
                reasoningContent: body.reasoningContent ?? null,
                images: body.images ? JSON.parse(JSON.stringify(body.images)) : undefined,
                orderIndex: nextOrder,
            },
        });
        // 세션 updatedAt 갱신
        await prisma.chatSession.update({
            where: { id: streamId },
            data: { updatedAt: new Date() },
        });
        const result = {
            id: message.id,
            streamId: message.streamId,
            role: message.role,
            content: message.content,
            reasoningContent: message.reasoningContent,
            images: message.images,
            orderIndex: message.orderIndex,
            createdAt: message.createdAt.toISOString(),
        };
        res.status(201).json({ message: result });
    }
    catch (error) {
        console.error("POST /chat/:streamId/messages error:", error);
        res.status(500).json({ error: "메시지 저장 실패" });
    }
});
//# sourceMappingURL=messages.js.map