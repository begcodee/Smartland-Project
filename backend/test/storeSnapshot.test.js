import assert from "node:assert/strict";
import test from "node:test";

import {
  assertSupportedSnapshot,
  hydrateStore,
  isSupportedSnapshot,
  serializeStore,
} from "../src/persistence/storeSnapshot.js";

function makeStore() {
  return {
    users: new Map(),
    parcels: new Map(),
    conversations: new Map(),
    messages: new Map(),
    payments: new Map(),
    transfers: new Map(),
    ratings: [],
    niaEmployees: new Map(),
    employeeAttempts: [],
    auditLogs: [],
    notifications: [],
    documentHashes: new Map(),
    imageHashes: new Map(),
    laws: [],
  };
}

test("snapshot support guard accepts the current serialized version", () => {
  const store = makeStore();
  store.users.set("user_1", { id: "user_1", role: "seller" });

  const snapshot = serializeStore(store);

  assert.equal(isSupportedSnapshot(snapshot), true);
  assert.doesNotThrow(() => assertSupportedSnapshot(snapshot));
});

test("snapshot support guard rejects missing or future versions", () => {
  for (const snapshot of [null, {}, { version: 2, users: [] }]) {
    assert.equal(isSupportedSnapshot(snapshot), false);
    assert.throws(
      () => assertSupportedSnapshot(snapshot),
      /refusing to seed and overwrite persisted state/
    );
  }
});

test("hydrateStore leaves existing state untouched for unsupported snapshots", () => {
  const store = makeStore();
  store.users.set("existing", { id: "existing", role: "seller" });

  const hydrated = hydrateStore(store, { version: 2, users: [["attacker", { id: "attacker" }]] });

  assert.equal(hydrated, false);
  assert.equal(store.users.has("existing"), true);
  assert.equal(store.users.has("attacker"), false);
});
