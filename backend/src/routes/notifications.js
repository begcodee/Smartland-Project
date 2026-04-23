import express from "express";
import { authenticate } from "../auth.js";
import { seedIfEmpty, store } from "../store.js";

const router = express.Router();

function id(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

function ensure() {
  if (!store.notifications) store.notifications = [];
}

router.get("/", authenticate, (req, res) => {
  seedIfEmpty();
  ensure();
  const mine = store.notifications
    .filter((n) => n.userId === req.user.id)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  res.json({ success: true, notifications: mine });
});

router.patch("/:id/read", authenticate, (req, res) => {
  seedIfEmpty();
  ensure();
  const n = store.notifications.find((x) => x.id === req.params.id && x.userId === req.user.id);
  if (!n) return res.status(404).json({ success: false, message: "Notification not found" });
  n.read = true;
  res.json({ success: true });
});

export function createNotification({ userId, type, title, message, category, actionUrl }) {
  seedIfEmpty();
  ensure();
  const n = {
    id: id("notif"),
    userId,
    type,
    title,
    message,
    category,
    actionUrl,
    read: false,
    createdAt: new Date().toISOString(),
  };
  store.notifications.push(n);
  return n;
}

export default router;

