import assert from "node:assert/strict";
import test from "node:test";

import {
  registerSchema,
  SELF_SERVICE_REGISTRATION_ROLES,
} from "../src/routes/auth.js";

const basePayload = {
  name: "Test User",
  email: "test.user@example.com",
  password: "Password123!",
  phoneNumber: "+233244123456",
};

test("self-service registration accepts only buyer and seller roles", () => {
  assert.deepEqual(SELF_SERVICE_REGISTRATION_ROLES, ["buyer", "seller"]);

  for (const role of SELF_SERVICE_REGISTRATION_ROLES) {
    const parsed = registerSchema.safeParse({ ...basePayload, role });
    assert.equal(parsed.success, true, `${role} should be self-service registrable`);
  }
});

test("self-service registration rejects privileged roles", () => {
  for (const role of ["admin", "lands_commission", "arbitrator", "nia"]) {
    const parsed = registerSchema.safeParse({ ...basePayload, role });
    assert.equal(parsed.success, false, `${role} must not be self-service registrable`);
  }
});
