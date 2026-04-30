const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { compareBaseline, createBaseline } = require("../src/integrity");

test("detects changed, added, and removed files", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fim-"));
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
