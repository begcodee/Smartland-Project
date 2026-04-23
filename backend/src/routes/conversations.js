import express from "express";
import { authenticate } from "../auth.js";
import { seedIfEmpty, store, publicUser } from "../store.js";
import { z } from "zod";

const router = express.Router();

function id(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

router.get("/", authenticate, (_req, res) => {
  seedIfEmpty();
  const me = _req.user.id;
  const convos = Array.from(store.conversations.values())
    .filter((c) => c.buyerId === me || c.sellerId === me)
    .map((c) => ({
      ...c,
      buyer: publicUser(store.users.get(c.buyerId)),
      seller: publicUser(store.users.get(c.sellerId)),
      parcel: store.parcels.get(c.parcelId) || null,
      lastMessageAt:
        (store.messages.get(c.id) || []).at(-1)?.createdAt || c.createdAt,
    }))
    .sort((a, b) => String(b.lastMessageAt).localeCompare(String(a.lastMessageAt)));

  res.json({ success: true, conversations: convos });
});

router.post("/start", authenticate, (req, res) => {
  seedIfEmpty();
  const parsed = z
    .object({ parcelId: z.string().min(1).optional(), landParcelId: z.string().min(1).optional() })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const parcelId = parsed.data.parcelId ?? parsed.data.landParcelId;
  if (!parcelId) return res.status(400).json({ error: "landParcelId is required" });

  const parcel = store.parcels.get(parcelId);
  if (!parcel) return res.status(404).json({ error: "Parcel not found" });

  const buyerId = req.user.id;
  const sellerId = parcel.sellerId;

  let convo = Array.from(store.conversations.values()).find(
    (c) => c.parcelId === parcelId && c.buyerId === buyerId && c.sellerId === sellerId
  );

  if (!convo) {
    convo = {
      id: id("convo"),
      parcelId,
      buyerId,
      sellerId,
      createdAt: new Date().toISOString(),
    };
    store.conversations.set(convo.id, convo);
    store.messages.set(convo.id, []);
  }

  res.json({
    success: true,
    conversation: {
      id: convo.id,
      landParcel: { id: parcel.id, title: parcel.title },
      buyer: publicUser(store.users.get(convo.buyerId)),
      seller: publicUser(store.users.get(convo.sellerId)),
    },
  });
});

router.get("/:id", authenticate, (req, res) => {
  seedIfEmpty();
  const convo = store.conversations.get(req.params.id);
  if (!convo) return res.status(404).json({ error: "Conversation not found" });
  if (convo.buyerId !== req.user.id && convo.sellerId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const parcel = store.parcels.get(convo.parcelId) || null;
  res.json({
    success: true,
    conversation: {
      id: convo.id,
      landParcel: parcel ? { id: parcel.id, title: parcel.title } : undefined,
      buyer: publicUser(store.users.get(convo.buyerId)),
      seller: publicUser(store.users.get(convo.sellerId)),
    },
  });
});

router.get("/:id/messages", authenticate, (req, res) => {
  seedIfEmpty();
  const convo = store.conversations.get(req.params.id);
  if (!convo) return res.status(404).json({ error: "Conversation not found" });
  if (convo.buyerId !== req.user.id && convo.sellerId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const msgs = store.messages.get(convo.id) || [];
  res.json({
    success: true,
    messages: msgs.map((m) => ({
      id: m.id,
      body: m.text,
      createdAt: m.createdAt,
      senderId: m.senderId,
      sender: publicUser(store.users.get(m.senderId)),
      attachments: Array.isArray(m.attachments) ? m.attachments : [],
    })),
  });
});

router.post("/:id/messages", authenticate, (req, res) => {
  seedIfEmpty();
  const convo = store.conversations.get(req.params.id);
  if (!convo) return res.status(404).json({ error: "Conversation not found" });
  if (convo.buyerId !== req.user.id && convo.sellerId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const parsed = z
    .object({
      text: z.string().trim().min(1).max(2000).optional(),
      body: z.string().trim().min(1).max(2000).optional(),
      attachments: z
        .array(
          z.object({
            kind: z.enum(["image", "document"]),
            name: z.string().trim().min(1).max(200),
            mimeType: z.string().trim().min(1).max(120),
            dataUrl: z.string().trim().min(1).max(2_000_000), // demo guard (approx)
          })
        )
        .max(5)
        .optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const text = parsed.data.text ?? parsed.data.body;
  const attachments = parsed.data.attachments || [];
  if (!text && attachments.length === 0) return res.status(400).json({ error: "body is required" });

  const msg = {
    id: id("msg"),
    conversationId: convo.id,
    senderId: req.user.id,
    text: text || "",
    createdAt: new Date().toISOString(),
    attachments,
  };

  const arr = store.messages.get(convo.id) || [];
  arr.push(msg);
  store.messages.set(convo.id, arr);
  res.status(201).json({ success: true, message: msg });
});

export default router;

