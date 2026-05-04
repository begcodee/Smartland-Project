import assert from "node:assert/strict";
import test from "node:test";

import { signToken } from "../auth.js";
import paymentsRouter from "./payments.js";
import { store } from "../store.js";

function createMockRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function getRouteStack(router, path, method) {
  const layer = router.stack.find(
    (entry) => entry.route?.path === path && entry.route?.methods?.[method]
  );
  assert.ok(layer, `Expected ${method.toUpperCase()} ${path} route`);
  return layer.route.stack.map((entry) => entry.handle);
}

async function runRouteStack(handlers, req, res) {
  let idx = 0;
  const next = async (err) => {
    if (err) throw err;
    const handler = handlers[idx++];
    if (!handler) return;
    await handler(req, res, next);
  };
  await next();
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

test("payment verification rejects users other than the buyer before settlement", async () => {
  resetStore();

  const buyer = {
    id: "buyer-1",
    name: "Buyer One",
    email: "buyer@example.test",
    role: "buyer",
    verified: true,
  };
  const otherBuyer = {
    id: "buyer-2",
    name: "Buyer Two",
    email: "other@example.test",
    role: "buyer",
    verified: true,
  };
  const seller = {
    id: "seller-1",
    name: "Seller One",
    email: "seller@example.test",
    role: "seller",
    verified: true,
  };

  store.users.set(buyer.id, buyer);
  store.users.set(otherBuyer.id, otherBuyer);
  store.users.set(seller.id, seller);

  store.parcels.set("parcel-1", {
    id: "parcel-1",
    title: "Accra Parcel",
    sellerId: seller.id,
    status: "locked_for_transaction",
    registryClearance: "clear",
    lockedUntil: Date.now() + 60_000,
    transfers: [],
  });
  store.payments.set("DEMO_REFERENCE", {
    reference: "DEMO_REFERENCE",
    status: "success",
    parcelId: "parcel-1",
    buyerId: buyer.id,
    amountPesewas: 10000,
    currency: "GHS",
    createdAt: new Date().toISOString(),
    demo: true,
  });

  const req = {
    query: { reference: "DEMO_REFERENCE" },
    headers: { authorization: `Bearer ${signToken(otherBuyer)}` },
  };
  const res = createMockRes();
  const verifyHandlers = getRouteStack(paymentsRouter, "/verify", "get");

  await runRouteStack(verifyHandlers, req, res);

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { error: "Forbidden" });
  assert.equal(store.payments.get("DEMO_REFERENCE").status, "success");
  assert.equal(store.parcels.get("parcel-1").status, "locked_for_transaction");
  assert.equal(store.transfers.size, 0);
});
