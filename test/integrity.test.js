const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { compareBaseline, createBaseline, hashFile } = require("../src/integrity");

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "fim-"));
}

test("detects changed, added, and removed files", () => {
  const dir = makeTempDir();
  fs.writeFileSync(path.join(dir, "app.txt"), "version one");
  fs.writeFileSync(path.join(dir, "config.txt"), "enabled=true");

  const baseline = createBaseline(dir);

  fs.writeFileSync(path.join(dir, "app.txt"), "version two");
  fs.writeFileSync(path.join(dir, "new.txt"), "new file");
  fs.unlinkSync(path.join(dir, "config.txt"));

  const report = compareBaseline(dir, baseline);

  assert.equal(report.ok, false);
  assert.deepEqual(report.changed, ["app.txt"]);
  assert.deepEqual(report.added, ["new.txt"]);
  assert.deepEqual(report.removed, ["config.txt"]);
});

test("reports ok=true when nothing has changed", () => {
  const dir = makeTempDir();
  fs.writeFileSync(path.join(dir, "a.txt"), "a");
  fs.writeFileSync(path.join(dir, "b.txt"), "b");

  const baseline = createBaseline(dir);
  const report = compareBaseline(dir, baseline);

  assert.equal(report.ok, true);
  assert.equal(report.added.length, 0);
  assert.equal(report.removed.length, 0);
  assert.equal(report.changed.length, 0);
});

test("walks nested directories and uses forward-slash relative paths", () => {
  const dir = makeTempDir();
  fs.mkdirSync(path.join(dir, "nested", "deep"), { recursive: true });
  fs.writeFileSync(path.join(dir, "nested", "deep", "secret.txt"), "value");

  const baseline = createBaseline(dir);
  assert.ok(baseline.files.some((file) => file.path === "nested/deep/secret.txt"));
});

test("ignores .git and node_modules directories", () => {
  const dir = makeTempDir();
  fs.mkdirSync(path.join(dir, ".git"), { recursive: true });
  fs.mkdirSync(path.join(dir, "node_modules"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".git", "HEAD"), "ref: refs/heads/main");
  fs.writeFileSync(path.join(dir, "node_modules", "junk"), "ignore me");
  fs.writeFileSync(path.join(dir, "real.txt"), "keep me");

  const baseline = createBaseline(dir);
  assert.equal(baseline.files.length, 1);
  assert.equal(baseline.files[0].path, "real.txt");
});

test("hashFile produces deterministic SHA-256 hex of length 64", () => {
  const dir = makeTempDir();
  const filePath = path.join(dir, "x.bin");
  fs.writeFileSync(filePath, "hello world");
  const first = hashFile(filePath);
  const second = hashFile(filePath);
  assert.equal(first, second);
  assert.equal(first.length, 64);
  assert.match(first, /^[0-9a-f]{64}$/);
});
