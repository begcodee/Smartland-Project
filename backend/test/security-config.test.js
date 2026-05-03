import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

function runModule(modulePath, env = {}) {
  return spawnSync(process.execPath, ["--input-type=module", "-e", `import "${modulePath}";`], {
    cwd: new URL("..", import.meta.url),
    env: {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      NODE_ENV: "test",
      ...env,
    },
    encoding: "utf8",
  });
}

function runCode(code, env = {}) {
  return spawnSync(process.execPath, ["--input-type=module", "-e", code], {
    cwd: new URL("..", import.meta.url),
    env: {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      NODE_ENV: "test",
      ...env,
    },
    encoding: "utf8",
  });
}

test("auth refuses placeholder JWT secrets in production", () => {
  for (const secret of [undefined, "dev-secret-change-me", "change-me-in-production"]) {
    const env = { NODE_ENV: "production" };
    if (secret) env.JWT_SECRET = secret;

    const result = runModule("./src/auth.js", env);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /JWT_SECRET must be set to a non-placeholder value in production/);
  }
});

test("auth allows non-placeholder JWT secret in production", () => {
  const result = runModule("./src/auth.js", {
    NODE_ENV: "production",
    JWT_SECRET: "a-realistic-random-secret-for-tests",
  });

  assert.equal(result.status, 0, result.stderr);
});

test("demo seed data is disabled in production unless explicitly opted in", () => {
  const seedCheck = `
    import { seedIfEmpty } from "./src/store.js";
    try {
      seedIfEmpty();
      console.log("seeded");
    } catch {
      console.log("blocked");
    }
  `;

  const blocked = runCode(seedCheck, { NODE_ENV: "production" });
  assert.equal(blocked.status, 0, blocked.stderr);
  assert.equal(blocked.stdout.trim(), "blocked");

  const allowed = runCode(seedCheck, {
    NODE_ENV: "production",
    SMARTLAND_SEED_DEMO_USERS: "true",
  });
  assert.equal(allowed.status, 0, allowed.stderr);
  assert.equal(allowed.stdout.trim(), "seeded");
});
