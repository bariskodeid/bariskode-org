import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(__filename), '..');
const migrationsDir = path.join(rootDir, 'apps', 'pocketbase', 'pb_migrations');

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

if (!fs.existsSync(migrationsDir)) {
  fail(`Directory not found: ${migrationsDir}`);
}

const files = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.js'))
  .sort((a, b) => a.localeCompare(b));

if (files.length === 0) {
  fail('No migration files found.');
}

const seenPrefixes = new Set();
let previousPrefix = -1;

for (const file of files) {
  const match = file.match(/^(\d+)_([a-z0-9_]+)\.js$/i);
  if (!match) {
    fail(`Invalid migration filename format: ${file}. Expected <timestamp>_<description>.js`);
  }

  const prefix = match[1];
  if (seenPrefixes.has(prefix)) {
    fail(`Duplicate migration timestamp prefix detected: ${prefix}`);
  }

  const prefixNumber = Number(prefix);
  if (!Number.isSafeInteger(prefixNumber)) {
    fail(`Invalid numeric migration prefix: ${prefix} in ${file}`);
  }

  if (previousPrefix >= 0 && prefixNumber < previousPrefix) {
    fail(`Migration prefixes must be non-decreasing. Found ${prefix} after ${previousPrefix}.`);
  }

  seenPrefixes.add(prefix);
  previousPrefix = prefixNumber;

  const filePath = path.join(migrationsDir, file);
  const source = fs.readFileSync(filePath, 'utf8');
  const hasRollbackCallback = /migrate\s*\(\s*\(app\)\s*=>\s*\{[\s\S]*?\}\s*,\s*\(app\)\s*=>\s*\{/.test(source);
  if (!hasRollbackCallback) {
    fail(`Migration must include rollback callback: ${file}`);
  }
}

const baseRef = process.env.GITHUB_BASE_REF;
const eventName = process.env.GITHUB_EVENT_NAME;
const beforeSha = process.env.GITHUB_EVENT_BEFORE;
const currentSha = process.env.GITHUB_SHA;
const allZeroSha = /^0+$/;

let compareRange = '';
if (baseRef) {
  compareRange = `origin/${baseRef}...HEAD`;
} else if (eventName === 'push' && beforeSha && currentSha && !allZeroSha.test(beforeSha)) {
  compareRange = `${beforeSha}...${currentSha}`;
} else if (eventName === 'push') {
  try {
    execFileSync('git', ['rev-parse', '--verify', 'HEAD~1'], {
      cwd: rootDir,
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    compareRange = 'HEAD~1...HEAD';
  } catch {
    compareRange = '';
  }
}

if (compareRange) {
  let diffOutput = '';
  try {
    diffOutput = execFileSync('git', ['diff', '--name-status', compareRange, '--', 'apps/pocketbase/pb_migrations'], {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    fail(`Unable to compare migration immutability for range: ${compareRange}`);
  }

  const changedStatuses = diffOutput
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('A\t'));

  if (changedStatuses.length > 0) {
    fail(`Existing migrations are immutable. Found non-addition changes:\n${changedStatuses.join('\n')}`);
  }
}

console.log(`✅ PocketBase migration check passed (${files.length} files).`);
