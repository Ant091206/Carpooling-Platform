import { existsSync, statSync, readdirSync } from 'fs';
import { execSync, spawnSync } from 'child_process';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Free port 5000 if a stale process is holding it (Windows-safe)
// ─────────────────────────────────────────────────────────────────────────────
try {
  const result = spawnSync('powershell', [
    '-NoProfile', '-NonInteractive', '-Command',
    `$proc = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ` +
    `Select-Object -ExpandProperty OwningProcess -First 1; ` +
    `if ($proc) { Stop-Process -Id $proc -Force; Write-Host "Killed PID $proc on port 5000" } ` +
    `else { Write-Host "Port 5000 is free" }`
  ], { encoding: 'utf8' });
  console.log((result.stdout || '').trim());
} catch (e) {
  // Non-Windows or permission denied — skip silently
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Conditionally regenerate Prisma Client only when needed
// ─────────────────────────────────────────────────────────────────────────────
const schemaPath = path.resolve('server/prisma/schema.prisma');
const clientPath = path.resolve('server/node_modules/.prisma/client');

let needGenerate = false;
let engineFile = null;

if (!existsSync(clientPath)) {
  console.log('Prisma Client not found. Generating...');
  needGenerate = true;
} else {
  try {
    const files = readdirSync(clientPath);
    const found = files.find(f => f.startsWith('query_engine'));
    if (found) {
      engineFile = path.join(clientPath, found);
    }
  } catch (_) {
    // ignore read errors
  }

  if (!engineFile) {
    console.log('Prisma query engine binary not found. Generating...');
    needGenerate = true;
  } else {
    const schemaTime = statSync(schemaPath).mtimeMs;
    const engineTime = statSync(engineFile).mtimeMs;
    if (schemaTime > engineTime) {
      console.log('schema.prisma modified since last generation. Regenerating Prisma Client...');
      needGenerate = true;
    }
  }
}

if (needGenerate) {
  try {
    execSync('npx prisma generate', { cwd: 'server', stdio: 'pipe' });
    console.log('✅ Prisma Client generated successfully.');
  } catch (error) {
    const combined = [
      error.stdout?.toString() ?? '',
      error.stderr?.toString() ?? '',
      error.message ?? ''
    ].join('\n');

    if (combined.includes('EPERM') || combined.includes('operation not permitted')) {
      console.warn('⚠️  Prisma engine binary is still locked. Continuing with existing client.');
    } else {
      console.error('❌ Prisma generation failed:\n', combined);
      process.exit(1);
    }
  }
} else {
  console.log('✅ Prisma Client is up-to-date. Skipping generation.');
}
