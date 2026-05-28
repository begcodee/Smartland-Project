import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import express from "express";

import authRoutes from "../src/routes/auth.js";
import { store } from "../src/store.js";

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  return app;
}

function registerPayload(role, email) {
  return {
    name: "Test User",
    email,
    password: "Password123!",
    phoneNumber: "+233200000000",
    role,
    organization: "Test Org",
    staffId: "STAFF-123",
    arbitratorRegNo: "ARB-123",
  };
}

describe("auth registration", () => {
  let server;
  let baseUrl;

  before(async () => {
    const app = makeApp();
    await new Promise((resolve) => {
      server = app.listen(0, "127.0.0.1", resolve);
    });
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}/api/auth`;
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it("allows public buyer and seller self-registration", async () => {
    store.users.clear();

    for (const role of ["buyer", "seller"]) {
      const res = await fetch(`${baseUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerPayload(role, `${role}-${Date.now()}@example.com`)),
      });
      const body = await res.json();

      assert.equal(res.status, 201);
      assert.equal(body.user.role, role);
      assert.ok(body.token);
    }
  });

  it("rejects privileged role self-registration", async () => {
    store.users.clear();

    for (const role of ["admin", "lands_commission", "nia", "arbitrator"]) {
      const res = await fetch(`${baseUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerPayload(role, `${role}-${Date.now()}@example.com`)),
      });
      const body = await res.json();

      assert.equal(res.status, 403);
      assert.match(body.error, /must be provisioned/i);
    }
  });
});
