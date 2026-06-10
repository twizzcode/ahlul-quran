import fs from "node:fs";
import path from "node:path";

const migrationsDir = path.resolve("drizzle");
const journalPath = path.join(migrationsDir, "meta", "_journal.json");

function stripSqlComments(sql) {
  return sql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .trim();
}

function countStatements(sql) {
  const stripped = stripSqlComments(sql);

  if (!stripped) {
    return 0;
  }

  return stripped
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean).length;
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

function warn(message) {
  console.warn(`WARN: ${message}`);
}

if (!fs.existsSync(journalPath)) {
  fail(`Missing journal file: ${journalPath}`);
  process.exit(process.exitCode ?? 1);
}

const journal = JSON.parse(fs.readFileSync(journalPath, "utf8"));
const sqlFiles = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

const journalTags = journal.entries.map((entry) => entry.tag);
const journalFiles = new Set(journalTags.map((tag) => `${tag}.sql`));
const diskFiles = new Set(sqlFiles);

journal.entries.forEach((entry, index) => {
  const expectedIdx = index;
  const expectedPrefix = String(entry.idx).padStart(4, "0");

  if (entry.idx !== expectedIdx) {
    fail(`Journal idx mismatch for ${entry.tag}: expected ${expectedIdx}, got ${entry.idx}`);
  }

  if (!entry.tag.startsWith(`${expectedPrefix}_`)) {
    fail(
      `Journal tag prefix mismatch for ${entry.tag}: expected to start with ${expectedPrefix}_`,
    );
  }

  if (index > 0) {
    const previous = journal.entries[index - 1];
    if (entry.when < previous.when) {
      warn(
        `Non-monotonic journal timestamp: ${entry.tag} (${entry.when}) is earlier than ${previous.tag} (${previous.when})`,
      );
    }
  }

  const migrationFile = path.join(migrationsDir, `${entry.tag}.sql`);
  if (!fs.existsSync(migrationFile)) {
    fail(`Journal entry ${entry.tag} has no matching SQL file`);
    return;
  }

  const content = fs.readFileSync(migrationFile, "utf8");
  const segments = content
    .split("--> statement-breakpoint")
    .map((segment) => segment.trim())
    .filter(Boolean);

  segments.forEach((segment, segmentIndex) => {
    const statementCount = countStatements(segment);

    if (statementCount > 1) {
      fail(
        `${entry.tag}.sql segment ${segmentIndex + 1} contains ${statementCount} SQL statements. Split them with '--> statement-breakpoint'.`,
      );
    }
  });
});

for (const file of sqlFiles) {
  if (!journalFiles.has(file)) {
    fail(`SQL file ${file} is not referenced by drizzle/meta/_journal.json`);
  }
}

for (const file of journalFiles) {
  if (!diskFiles.has(file)) {
    fail(`Journal references missing file ${file}`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("Migration files look consistent.");
