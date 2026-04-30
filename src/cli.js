const fs = require("node:fs");
const { compareBaseline, createBaseline } = require("./integrity");

const [command, targetDir = ".", baselinePath = "baseline.json"] = process.argv.slice(2);

if (!["baseline", "verify"].includes(command)) {
  console.log("Usage:");
  console.log("  node src/cli.js baseline <directory> <baseline.json>");
  console.log("  node src/cli.js verify <directory> <baseline.json>");
  process.exit(1);
}

if (command === "baseline") {
  const baseline = createBaseline(targetDir);
  fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
  console.log(`Baseline saved to ${baselinePath} with ${baseline.files.length} files.`);
}

if (command === "verify") {
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  const report = compareBaseline(targetDir, baseline);

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 2);
}
