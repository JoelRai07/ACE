/**
 * Code-Modul — kümmert sich um grep-basierte Pattern-Findings und
 * die Anreicherung vorhandener Findings mit Quellcode.
 */

import { execFile } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import type { UnifiedFinding, ViolationCategory } from "../types.js";

const execFileAsync = promisify(execFile);

const CONTEXT_LINES = 5;
const INCLUDE_EXTENSIONS = ["*.tsx", "*.ts", "*.jsx", "*.js"];
const MAX_MATCHES_PER_PATTERN = 8;
const MAX_MATCHES_PER_TERM = 1;

const PATTERNS: Record<string, { description: string; severity: UnifiedFinding["severity"]; wcag: string[]; level: UnifiedFinding["wcagLevel"]; category: ViolationCategory; flags: string[]; pattern: string }> = {
  "div-span-onclick": {
    description:
      "<div> oder <span> besitzen onClick, aber keinen Keyboard-Handler. Verwende <button> oder ergänze onKeyDown + role.",
    severity: "serious",
    wcag: ["2.1.1"],
    level: "A",
    category: "semantisch",
    flags: ["-E"],
    pattern: "<(div|span)[^>]*onClick=",
  },
  "img-missing-alt": {
    description: "<img> ohne alt-Attribut. Screenreader können das Bild nicht beschreiben.",
    severity: "critical",
    wcag: ["1.1.1"],
    level: "A",
    category: "syntaktisch",
    flags: ["-E"],
    pattern: "<img\\s(?![^>]*\\balt=)[^>]*(/>|>)",
  },
  "label-missing-htmlfor": {
    description: "<label> ohne htmlFor. Inputs bleiben unbeschriftet.",
    severity: "serious",
    wcag: ["1.3.1", "4.1.2"],
    level: "A",
    category: "syntaktisch",
    flags: ["-E"],
    pattern: "<label(?![^>]*htmlFor)[^>]*>",
  },
  "role-button-non-semantic": {
    description: 'role="button" auf Nicht-Button-Elementen. Prüfe Keyboard-Support.',
    severity: "moderate",
    wcag: ["2.1.1", "4.1.2"],
    level: "A",
    category: "semantisch",
    flags: ["-E"],
    pattern: 'role="button"',
  },
  "tabindex-removes-element": {
    description: "tabIndex=-1 entfernt Elemente aus der Tab-Reihenfolge.",
    severity: "moderate",
    wcag: ["2.1.1"],
    level: "A",
    category: "semantisch",
    flags: ["-E"],
    pattern: 'tabIndex=\\{-1\\}|tabIndex="-1"',
  },
  "autofocus-usage": {
    description: "autoFocus kann den Fokusfluss stören.",
    severity: "minor",
    wcag: ["2.4.3"],
    level: "A",
    category: "semantisch",
    flags: ["-F"],
    pattern: "autoFocus",
  },
};

interface GrepMatch {
  patternId: string;
  filePath: string;
  relativeFilePath: string;
  lineNumber: number;
  lineContent: string;
  codeSnippet: string;
  lineRange: [number, number];
}

export async function enrichWithCodeContext(findings: UnifiedFinding[], srcDir: string): Promise<void> {
  if (!fs.existsSync(srcDir)) {
    console.warn(`[code] srcDir nicht gefunden: ${srcDir}`);
    return;
  }

  let enriched = 0;

  for (const finding of findings) {
    if (!finding.selector || finding.componentPath) continue;
    const terms = extractSearchTerms(finding.selector);
    if (terms.length === 0) continue;

    for (const term of terms) {
      const hits = await runGrep(["-F"], term, srcDir, MAX_MATCHES_PER_TERM);
      if (hits.length === 0) continue;
      const hit = hits[0];
      const snippet = readSnippet(hit.filePath, hit.lineNumber);
      if (!snippet) continue;
      finding.componentPath = hit.relativeFilePath;
      finding.codeSnippet = snippet.snippet;
      finding.lineRange = snippet.lineRange;
      enriched += 1;
      break;
    }
  }

  console.log(`[code] ${enriched}/${findings.length} Findings mit Quellcode angereichert`);
}

export async function runGrepPatterns(srcDir: string): Promise<UnifiedFinding[]> {
  if (!fs.existsSync(srcDir)) {
    console.warn(`[code] srcDir nicht gefunden: ${srcDir}`);
    return [];
  }

  const matches: GrepMatch[] = [];

  for (const [patternId, definition] of Object.entries(PATTERNS)) {
    const hits = await runGrep(definition.flags, definition.pattern, srcDir, MAX_MATCHES_PER_PATTERN);
    for (const hit of hits) {
      const snippet = readSnippet(hit.filePath, hit.lineNumber);
      if (!snippet) continue;
      matches.push({
        patternId,
        filePath: hit.filePath,
        relativeFilePath: hit.relativeFilePath,
        lineNumber: hit.lineNumber,
        lineContent: hit.lineContent,
        codeSnippet: snippet.snippet,
        lineRange: snippet.lineRange,
      });
    }
    if (hits.length > 0) {
      console.log(`[code] ${patternId}: ${hits.length} Treffer`);
    }
  }

  return normalizeGrepMatches(matches);
}

// ── Hilfsfunktionen ─────────────────────────────────────────────────────

function extractSearchTerms(selector: string): string[] {
  const terms = new Set<string>();
  const idMatch = /^#([\w-]+)$|#([\w-]+)/.exec(selector);
  if (idMatch) {
    const id = idMatch[1] ?? idMatch[2];
    terms.add(`id="${id}"`);
    terms.add(`id='${id}'`);
    terms.add(`id={\`${id}\`}`);
  }
  const ariaMatch = /\[aria-label="([^"]+)"\]/.exec(selector);
  if (ariaMatch) {
    terms.add(`aria-label="${ariaMatch[1]}"`);
  }
  const classMatches = [...selector.matchAll(/\.([\w-]{4,})/g)];
  const GENERIC = new Set(["active", "disabled", "selected", "open", "hidden", "show", "fade"]);
  for (const cls of classMatches) {
    if (!GENERIC.has(cls[1])) terms.add(cls[1]);
  }
  const attrMatch = /\[([\w-]+)="([^"]{3,})"\]/.exec(selector);
  if (attrMatch && attrMatch[1] !== "aria-label") {
    terms.add(attrMatch[2]);
  }
  return [...terms];
}

async function runGrep(
  flags: string[],
  pattern: string,
  srcDir: string,
  maxMatches: number
): Promise<Array<{ filePath: string; relativeFilePath: string; lineNumber: number; lineContent: string }>> {
  try {
    const includeArgs = INCLUDE_EXTENSIONS.flatMap((ext) => ["--include", ext]);
    const args = ["-rn", ...flags, ...includeArgs, pattern, srcDir];
    const { stdout } = await execFileAsync("grep", args, { timeout: 8_000, maxBuffer: 1_024 * 1_024 });
    return stdout
      .split("\n")
      .filter(Boolean)
      .slice(0, maxMatches)
      .map((line) => parseGrepLine(line, srcDir))
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  } catch (err) {
    const code = (err as { code?: unknown }).code;
    if (code === 1 || code === "1") {
      return [];
    }
    console.warn(`[code] grep Warnung (${pattern.slice(0, 40)}): ${String(err).slice(0, 120)}`);
    return [];
  }
}

function parseGrepLine(
  line: string,
  srcDir: string
): { filePath: string; relativeFilePath: string; lineNumber: number; lineContent: string } | null {
  const match = /^(.+?):(\d+):(.*)$/.exec(line);
  if (!match) return null;
  const filePath = match[1];
  const lineNumber = Number(match[2]);
  if (Number.isNaN(lineNumber)) return null;
  const lineContent = match[3];
  const relativeFilePath = path.relative(srcDir, filePath);
  return { filePath, relativeFilePath, lineNumber, lineContent };
}

function readSnippet(
  filePath: string,
  lineNumber: number
): { snippet: string; lineRange: [number, number] } | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const startLine = Math.max(1, lineNumber - CONTEXT_LINES);
    const endLine = Math.min(lines.length, lineNumber + CONTEXT_LINES);
    const snippet = lines
      .slice(startLine - 1, endLine)
      .map((line, idx) => `${startLine + idx}: ${line}`)
      .join("\n");
    return { snippet, lineRange: [startLine, endLine] };
  } catch {
    return null;
  }
}

function normalizeGrepMatches(matches: GrepMatch[]): UnifiedFinding[] {
  const findings: UnifiedFinding[] = [];
  let counter = 0;

  for (const match of matches) {
    const definition = PATTERNS[match.patternId];
    if (!definition) continue;
    findings.push({
      id: `grep-${String(++counter).padStart(3, "0")}`,
      source: "grep",
      ruleId: match.patternId,
      description: definition.description,
      severity: definition.severity,
      wcagCriteria: definition.wcag,
      wcagLevel: definition.level,
      category: definition.category,
      selector: null,
      componentPath: match.relativeFilePath,
      codeSnippet: match.codeSnippet,
      lineRange: match.lineRange,
      rawData: {
        patternId: match.patternId,
        lineNumber: match.lineNumber,
        lineContent: match.lineContent,
        filePath: match.filePath,
      },
    });
  }

  const deduped: UnifiedFinding[] = [];
  const seen = new Set<string>();
  for (const finding of findings) {
    const key = `${finding.ruleId}|${finding.componentPath}|${finding.lineRange?.[0] ?? 0}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(finding);
  }

  console.log(`[code] ${deduped.length} Pattern-Findings nach Deduplizierung`);
  return deduped;
}
