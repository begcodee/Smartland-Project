import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import express from "express";

import authRoutes from "../src/routes/auth.js";
import { store } from "../src/store.js";

function resetStore() {
  store.users.clear();
  store.parcels.clear();
  store.conversations.clear();
  store.messages.clear();
  store.payments.clear();
  store.transfers.clear();
  store.niaEmployees.clear();
  store.documentHashes.clear();
  store.imageHashes.clear();
  store.ratings.length = 0;
  store.employeeAttempts.length = 0;
  store.auditLogs.length = 0;
  store.notifications.length = 0;
  store.laws.length = 0;
}

async function postJson(app, path, body) {
  const server = app.listen(0);
  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return { response, data };
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
}

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/auth", authRoutes);
  return app;
}

beforeEach(resetStore);
afterEach(resetStore);

test("self-service registration rejects privileged roles", async () => {
  const app = makeApp();
  const { response, data } = await postJson(app, "/auth/register", {
    name: "Mallory Staff",
    email: "mallory@example.com",
    password: "Password123!",
    role: "nia",
    phoneNumber: "+233000000000",
    staffId: "NIA-ATTACKER",
  });

  assert.equal(response.status, 403);
  assert.match(data.error, /Privileged accounts/);
  assert.equal(
    Array.from(store.users.values()).some((u) => u.email === "mallory@example.com"),
    false
  );
});

test("self-service registration still allows ordinary buyer accounts", async () => {
  const app = makeApp();
  const { response, data } = await postJson(app, "/auth/register", {
    name: "Ama Buyer",
    email: "ama@example.com",
    password: "Password123!",
    role: "buyer",
    phoneNumber: "+233000000001",
  });

  assert.equal(response.status, 201);
  assert.equal(data.user.email, "ama@example.com");
  assert.equal(data.user.role, "buyer");
  assert.equal(typeof data.token, "string");
});
