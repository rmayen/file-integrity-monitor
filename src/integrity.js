const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

function walkFiles(rootDir) {
  const results = [];

  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const fullPath = path.join(rootDir, entry.name);

    if (entry.name === ".git" || entry.name === "node_modules") {
      continue;
    }

    if (entry.isDirectory()) {
      results.push(...walkFiles(fullPath));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }

  return results.sort();
}

function hashFile(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function createBaseline(rootDir) {
  const absoluteRoot = path.resolve(rootDir);
  const files = walkFiles(absoluteRoot).map((filePath) => ({
    path: path.relative(absoluteRoot, filePath).replaceAll("\\", "/"),
    sha256: hashFile(filePath),
    size: fs.statSync(filePath).size
  }));

  return {
    root: absoluteRoot,
    createdAt: new Date().toISOString(),
    files
  };
}

function compareBaseline(rootDir, baseline) {
  const current = createBaseline(rootDir);
  const expectedByPath = new Map(baseline.files.map((file) => [file.path, file]));
  const currentByPath = new Map(current.files.map((file) => [file.path, file]));
  const added = [];
  const removed = [];
  const changed = [];

  for (const file of current.files) {
    const expected = expectedByPath.get(file.path);

    if (!expected) {
      added.push(file.path);
    } else if (expected.sha256 !== file.sha256 || expected.size !== file.size) {
      changed.push(file.path);
    }
  }

  for (const file of baseline.files) {
    if (!currentByPath.has(file.path)) {
      removed.push(file.path);
    }
  }

  return { added, removed, changed, ok: added.length === 0 && removed.length === 0 && changed.length === 0 };
}

module.exports = { compareBaseline, createBaseline, hashFile, walkFiles };
