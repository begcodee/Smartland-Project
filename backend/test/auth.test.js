import assert from "node:assert/strict";
import { after, afterEach, beforeEach, describe, it } from "node:test";

import express from "express";

import authRoutes from "../src/routes/auth.js";
import { store } from "../src/store.js";

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  return app;
}

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

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return {
    status: res.status,
    body: await res.json(),
  };
}

describe("auth registration", () => {
  let server;
  let baseUrl;

  beforeEach(async () => {
    resetStore();
    server = createTestApp().listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(() => {
    resetStore();
  });

  afterEach(async () => {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    resetStore();
  });

  it("rejects public registration for privileged staff roles", async () => {
    for (const role of ["admin", "lands_commission", "nia", "arbitrator"]) {
      const email = `${role.replace("_", "-")}@attacker.example`;
      const res = await postJson(`${baseUrl}/api/auth/register`, {
        name: "Privilege Seeker",
        email,
        password: "Password123!",
        role,
      });

      assert.equal(res.status, 400);
      assert.equal(res.body.error, "Invalid payload");
      assert.equal(
        Array.from(store.users.values()).some((user) => user.email === email),
        false
      );
    }
  });

  it("allows public registration for buyer and seller accounts", async () => {
    for (const role of ["buyer", "seller"]) {
      const email = `public-${role}@example.test`;
      const res = await postJson(`${baseUrl}/api/auth/register`, {
        name: `${role} User`,
        email,
        password: "Password123!",
        role,
        phoneNumber: "+233000000000",
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.user.email, email);
      assert.equal(res.body.user.role, role);
      assert.match(res.body.token, /^ey/);
    }
  });
});
