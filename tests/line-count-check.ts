/**
 * 200-Line Rule Enforcement Script.
 * Scans all .ts/.tsx files under src/ and fails if any exceed 200 lines.
 *
 * Usage: npx tsx tests/line-count-check.ts
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

const SRC_DIR = join(__dirname, '..', 'src');
const MAX_LINES = 200;

function getAllFiles(dir: string, exts: string[]): string[] {
    const results: string[] = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            results.push(...getAllFiles(full, exts));
        } else if (exts.some((ext) => full.endsWith(ext))) {
            results.push(full);
        }
    }
    return results;
}

function main() {
    const files = getAllFiles(SRC_DIR, ['.ts', '.tsx']);
    const violations: Array<{ file: string; lines: number }> = [];

    for (const file of files) {
        const content = readFileSync(file, 'utf-8');
        const lineCount = content.split('\n').length;
        if (lineCount > MAX_LINES) {
            violations.push({ file: relative(SRC_DIR, file), lines: lineCount });
        }
    }

    if (violations.length > 0) {
        console.error('\n❌ 200-Line Rule Violations:\n');
        for (const v of violations) {
            console.error(`  ${v.file}: ${v.lines} lines (limit: ${MAX_LINES})`);
        }
        console.error(`\n${violations.length} file(s) exceed the limit.\n`);
        process.exit(1);
    }

    console.log(`\n✅ All ${files.length} files are within ${MAX_LINES} lines.\n`);
}

main();
