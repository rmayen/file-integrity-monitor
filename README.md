# File Integrity Monitor

A defensive command-line tool that creates a SHA-256 baseline for a directory and later verifies whether files were added, removed, or changed.

## Why It Matters

File integrity monitoring is a basic security control used to detect unexpected changes in configuration files, scripts, and application assets.

## Features

- Recursively scans files in a target directory
- Creates SHA-256 hashes for every file
- Saves a JSON baseline
- Reports added, removed, and changed files
- Includes automated tests

## Usage

```bash
npm test
node src/cli.js baseline ./example baseline.json
node src/cli.js verify ./example baseline.json
```

The tool uses only Node's standard library — no `npm install` is required.

## What Counts as a Change

A file is reported as `changed` when its SHA-256 hash or its size differs from the baseline. `added` files are present now but not in the baseline; `removed` files are in the baseline but missing now. `.git` and `node_modules` are skipped during scanning.

The `verify` command exits with code `0` if everything matches and `2` otherwise, so it can be used in scripts and CI checks.

## Output Example

```json
{
  "added": ["new-config.json"],
  "removed": [],
  "changed": ["server.js"],
  "ok": false
}
```

## Project Structure

```text
src/
  cli.js
  integrity.js
test/
  integrity.test.js
```

## My Role

Solo developer. Designed the baseline-and-verify workflow, implemented the recursive scanner and SHA-256 hashing layer in `src/integrity.js`, built the CLI in `src/cli.js`, and wrote the unit tests in `test/integrity.test.js`. The project intentionally uses only Node's standard library to keep the supply-chain surface minimal.

## What I Learned

The hardest part was deciding what should count as a "change." Hashing alone catches content edits, but I added a size check so the report can distinguish quickly. I also learned to think about this tool from a defender's point of view — the JSON report needs to be machine-readable (for CI / scripting) but the exit codes need to be unambiguous so a build can fail on tampering. Building it with zero npm dependencies was a deliberate choice: a security tool that pulls in a tree of third-party packages defeats its own purpose.
