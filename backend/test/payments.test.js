import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import express from "express";

import { signToken } from "../src/auth.js";
import paymentRoutes from "../src/routes/payments.js";
import { store } from "../src/store.js";

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/payments", paymentRoutes);
  return app;
}

function resetStore() {
  store.users.clear();
  store.parcels.clear();
  store.conversations.clear();
  store.messages.clear();
  store.payments.clear();
  store.transfers.clear();
  store.ratings = [];
  store.auditLogs = [];
  store.notifications = [];
  store.documentHashes.clear();
  store.imageHashes.clear();
}

describe("payment initialization", () => {
  let server;
  let baseUrl;
  let oldPaystackSecret;

  before(async () => {
    oldPaystackSecret = process.env.PAYSTACK_SECRET_KEY;
    delete process.env.PAYSTACK_SECRET_KEY;

    const app = makeApp();
    await new Promise((resolve) => {
      server = app.listen(0, "127.0.0.1", resolve);
    });
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}/api/payments`;
  });

  beforeEach(() => {
    resetStore();
  });

  after(async () => {
    if (oldPaystackSecret) process.env.PAYSTACK_SECRET_KEY = oldPaystackSecret;
    else delete process.env.PAYSTACK_SECRET_KEY;

    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it("charges the server-side parcel price instead of a client-supplied amount", async () => {
    const buyer = {
      id: "buyer-test",
      name: "Buyer",
      email: "buyer@example.test",
      role: "buyer",
      verified: true,
      niaStatus: "verified",
    };
    const seller = {
      id: "seller-test",
      name: "Seller",
      email: "seller@example.test",
      role: "seller",
      verified: true,
      niaStatus: "verified",
    };
    const parcel = {
      id: "parcel-test",
      title: "Server-priced parcel",
      sellerId: seller.id,
      status: "available",
      priceGhs: 45000,
      registryClearance: "clear",
      transfers: [],
    };
    store.users.set(buyer.id, buyer);
    store.users.set(seller.id, seller);
    store.parcels.set(parcel.id, parcel);

    const token = signToken(buyer);
    const res = await fetch(`${baseUrl}/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        parcelId: parcel.id,
        amountGhs: 0.01,
      }),
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    const payment = store.payments.get(body.reference);
    assert.ok(payment);
    assert.equal(payment.amountPesewas, 4_500_000);
  });
});
