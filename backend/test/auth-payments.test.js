import assert from "node:assert/strict";
import test from "node:test";

import express from "express";

import { signToken } from "../src/auth.js";
import authRoutes from "../src/routes/auth.js";
import paymentRoutes from "../src/routes/payments.js";
import { store } from "../src/store.js";

function resetStore() {
  for (const value of Object.values(store)) {
    if (value instanceof Map) value.clear();
    else if (Array.isArray(value)) value.length = 0;
  }
}

function seedPaymentFixture() {
  resetStore();
  delete process.env.PAYSTACK_SECRET_KEY;
  delete process.env.STRICT_SELLER_PROTOCOLS;

  const buyer = {
    id: "buyer_test",
    name: "Buyer Test",
    email: "buyer@test.smartland",
    role: "buyer",
    passwordHash: "unused",
    niaStatus: "verified",
    verified: true,
    createdAt: new Date().toISOString(),
  };
  const otherBuyer = {
    ...buyer,
    id: "buyer_other",
    name: "Other Buyer",
    email: "other@test.smartland",
  };
  const seller = {
    id: "seller_test",
    name: "Seller Test",
    email: "seller@test.smartland",
    role: "seller",
    passwordHash: "unused",
    niaStatus: "verified",
    verified: true,
    createdAt: new Date().toISOString(),
  };
  const parcel = {
    id: "parcel_test",
    title: "Verified parcel",
    location: "Accra",
    priceGhs: 1000,
    status: "available",
    registryClearance: "clear",
    redFlag: null,
    sellerId: seller.id,
    createdAt: new Date().toISOString(),
    transfers: [],
  };

  store.users.set(buyer.id, buyer);
  store.users.set(otherBuyer.id, otherBuyer);
  store.users.set(seller.id, seller);
  store.parcels.set(parcel.id, parcel);

  return {
    buyer,
    otherBuyer,
    seller,
    parcel,
    buyerToken: signToken(buyer),
    otherBuyerToken: signToken(otherBuyer),
  };
}

async function withServer(fn) {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use("/api/payments", paymentRoutes);

  const server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  const { port } = server.address();
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

async function jsonRequest(baseUrl, path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  return { response, data };
}

test("public registration rejects privileged staff roles", async () => {
  resetStore();

  await withServer(async (baseUrl) => {
    const { response, data } = await jsonRequest(baseUrl, "/api/auth/register", {
      method: "POST",
      body: {
        name: "Attacker",
        email: "attacker@example.com",
        password: "Password123!",
        role: "nia",
      },
    });

    assert.equal(response.status, 400);
    assert.match(data.error, /Invalid payload/);
    assert.equal(
      Array.from(store.users.values()).some((u) => u.email === "attacker@example.com"),
      false
    );
  });
});

test("payment initialize rejects a client-controlled underpayment", async () => {
  const { buyerToken, parcel } = seedPaymentFixture();

  await withServer(async (baseUrl) => {
    const { response, data } = await jsonRequest(baseUrl, "/api/payments/initialize", {
      method: "POST",
      token: buyerToken,
      body: {
        landParcelId: parcel.id,
        amountGhs: 0.01,
        channel: "mobile_money",
      },
    });

    assert.equal(response.status, 400);
    assert.match(data.error, /match parcel price/);
    assert.equal(store.parcels.get(parcel.id).status, "available");
    assert.equal(store.payments.size, 0);
  });
});

test("only the buyer who initialized a payment can verify it", async () => {
  const { buyerToken, otherBuyerToken, parcel } = seedPaymentFixture();

  await withServer(async (baseUrl) => {
    const init = await jsonRequest(baseUrl, "/api/payments/initialize", {
      method: "POST",
      token: buyerToken,
      body: {
        landParcelId: parcel.id,
        amountGhs: parcel.priceGhs,
        channel: "mobile_money",
      },
    });
    assert.equal(init.response.status, 200);

    const { response, data } = await jsonRequest(
      baseUrl,
      `/api/payments/verify?reference=${encodeURIComponent(init.data.reference)}`,
      { token: otherBuyerToken }
    );

    assert.equal(response.status, 403);
    assert.match(data.error, /buyer who started/);
    assert.equal(store.transfers.size, 0);
    assert.equal(store.parcels.get(parcel.id).status, "locked_for_transaction");
  });
});

test("payment verify settles the buyer's own transaction lock exactly once", async () => {
  const { buyerToken, parcel } = seedPaymentFixture();

  await withServer(async (baseUrl) => {
    const init = await jsonRequest(baseUrl, "/api/payments/initialize", {
      method: "POST",
      token: buyerToken,
      body: {
        landParcelId: parcel.id,
        amountGhs: parcel.priceGhs,
        channel: "mobile_money",
      },
    });
    assert.equal(init.response.status, 200);
    assert.equal(store.parcels.get(parcel.id).lockedPaymentReference, init.data.reference);

    const first = await jsonRequest(
      baseUrl,
      `/api/payments/verify?reference=${encodeURIComponent(init.data.reference)}`,
      { token: buyerToken }
    );
    assert.equal(first.response.status, 200);
    assert.equal(first.data.status, "success");
    assert.ok(first.data.transfer?.id);
    assert.equal(store.parcels.get(parcel.id).status, "sold");
    assert.equal(store.parcels.get(parcel.id).lockedPaymentReference, null);
    assert.equal(store.transfers.size, 1);

    const second = await jsonRequest(
      baseUrl,
      `/api/payments/verify?reference=${encodeURIComponent(init.data.reference)}`,
      { token: buyerToken }
    );
    assert.equal(second.response.status, 200);
    assert.equal(second.data.transfer.id, first.data.transfer.id);
    assert.equal(store.transfers.size, 1);
  });
});
