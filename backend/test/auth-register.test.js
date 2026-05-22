import test from "node:test";
import assert from "node:assert/strict";
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
  store.ratings.length = 0;
  store.niaEmployees.clear();
  store.employeeAttempts.length = 0;
  store.auditLogs.length = 0;
  store.notifications.length = 0;
  store.documentHashes.clear();
  store.imageHashes.clear();
  store.laws.length = 0;
}

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  return app;
}

async function postJson(app, path, body) {
  const server = app.listen(0);
  try {
    const address = server.address();
    assert(address && typeof address === "object");
    const res = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return {
      status: res.status,
      body: await res.json(),
    };
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

test.beforeEach(() => {
  resetStore();
});

test("public registration rejects privileged roles without creating users", async () => {
  const app = createApp();
  const roles = ["admin", "lands_commission", "nia", "arbitrator"];

  for (const role of roles) {
    const email = `${role}-${Date.now()}@example.test`;
    const res = await postJson(app, "/api/auth/register", {
      name: "Privilege Seeker",
      email,
      password: "Password123!",
      role,
      phoneNumber: "+233200000000",
      staffId: "STAFF-1",
      arbitratorRegNo: "ARB-1",
    });

    assert.equal(res.status, 403);
    assert.equal(res.body.token, undefined);
    assert.equal(
      Array.from(store.users.values()).some((u) => u.email === email),
      false
    );
  }
});

test("public registration still creates buyer and seller accounts", async () => {
  const app = createApp();

  for (const role of ["buyer", "seller"]) {
    const email = `${role}-${Date.now()}@example.test`;
    const res = await postJson(app, "/api/auth/register", {
      name: "Public Registrant",
      email,
      password: "Password123!",
      role,
      phoneNumber: "+233200000000",
    });

    assert.equal(res.status, 201);
    assert.equal(typeof res.body.token, "string");
    assert.equal(res.body.user.email, email);
    assert.equal(res.body.user.role, role);
  }
});
