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
npm install
npm test
node src/cli.js baseline ./example baseline.json
node src/cli.js verify ./example baseline.json
```

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
