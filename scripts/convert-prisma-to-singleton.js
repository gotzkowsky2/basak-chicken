#!/usr/bin/env node
/*
 * Replace `import { PrismaClient } from '@prisma/client'` with
 * `import prisma from '@/lib/prisma'` and remove local `new PrismaClient()` usages
 * under src/app/api.
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TARGET_DIR = path.join(ROOT, 'src', 'app', 'api');

/**
 * Recursively list all files in a directory
 */
function listFilesRecursively(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(listFilesRecursively(full));
    } else if (entry.isFile() && (full.endsWith('.ts') || full.endsWith('.tsx'))) {
      results.push(full);
    }
  }
  return results;
}

function transformContents(contents) {
  let changed = false;
  // Replace import { PrismaClient } from '@prisma/client'; (single or double quotes)
  const importRegex = /import\s*\{\s*PrismaClient\s*\}\s*from\s*['"]@prisma\/client['"];?/g;
  if (importRegex.test(contents)) {
    contents = contents.replace(importRegex, "import prisma from '@/lib/prisma'");
    changed = true;
  }

  // Remove: const prisma = new PrismaClient(); (with optional spaces/semicolon)
  const ctorRegex = /\n?\s*const\s+prisma\s*=\s*new\s+PrismaClient\s*\(\s*\)\s*;?/g;
  if (ctorRegex.test(contents)) {
    contents = contents.replace(ctorRegex, '');
    changed = true;
  }

  return { contents, changed };
}

function main() {
  if (!fs.existsSync(TARGET_DIR)) {
    console.error(`Target directory not found: ${TARGET_DIR}`);
    process.exit(1);
  }

  const files = listFilesRecursively(TARGET_DIR);
  let updatedCount = 0;
  for (const file of files) {
    const original = fs.readFileSync(file, 'utf8');
    const { contents, changed } = transformContents(original);
    if (changed) {
      fs.writeFileSync(file, contents, 'utf8');
      updatedCount += 1;
      console.log(`Updated: ${path.relative(ROOT, file)}`);
    }
  }
  console.log(`\nDone. Files updated: ${updatedCount}/${files.length}`);
}

main();



