import assert from "node:assert/strict";
import { test } from "node:test";

import {
  releaseExpiredTransactionLock,
  toPesewas,
  validateCheckoutAmount,
} from "../src/routes/payments.js";

test("checkout amount defaults to the parcel price", () => {
  assert.equal(validateCheckoutAmount({ priceGhs: 85000 }), 8_500_000);
});

test("checkout amount rejects underpayment", () => {
  assert.throws(
    () => validateCheckoutAmount({ priceGhs: 85000 }, 1),
    (err) => {
      assert.equal(err.message, "Payment amount must match parcel price");
      assert.equal(err.expectedAmountPesewas, 8_500_000);
      assert.equal(err.requestedAmountPesewas, 100);
      return true;
    }
  );
});

test("checkout amount accepts the exact parcel price", () => {
  assert.equal(validateCheckoutAmount({ priceGhs: 85000 }, 85000), 8_500_000);
});

test("expired transaction locks are released before checkout", () => {
  const parcel = {
    status: "locked_for_transaction",
    lockedUntil: Date.now() - 1,
  };

  assert.equal(releaseExpiredTransactionLock(parcel, Date.now()), true);
  assert.equal(parcel.status, "available");
  assert.equal(parcel.lockedUntil, null);
});

test("active transaction locks are preserved", () => {
  const lockedUntil = Date.now() + 60_000;
  const parcel = {
    status: "locked_for_transaction",
    lockedUntil,
  };

  assert.equal(releaseExpiredTransactionLock(parcel, Date.now()), false);
  assert.equal(parcel.status, "locked_for_transaction");
  assert.equal(parcel.lockedUntil, lockedUntil);
});

test("amount conversion rejects invalid values", () => {
  assert.throws(() => toPesewas(0), /Invalid amountGhs/);
  assert.throws(() => toPesewas(Number.NaN), /Invalid amountGhs/);
});
