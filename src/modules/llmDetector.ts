import * as fs from "fs";
import * as path from "path";
import { callOllama } from "../ollama.js";
import type { BuiltPrompt } from "../prompt.js";
import type { LlmResult } from "../ollama.js";
import type { UnifiedFinding, ViolationCategory, WcagLevel, Severity } from "../types.js";

interface LlmCodeFinding {
  title: string;
  ruleId: string;
  wcagCriteria: string[];
  wcagLevel: WcagLevel;
  severity: Severity;
  category: ViolationCategory;
  filePath: string;
  startLine: number;
  endLine: number;
  evidence: string;
  fixSuggestion: string;
}

interface SourceChunk {
  index: number;
  content: string;
  files: string[];
}

const INCLUDE_EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js", ".css"]);
const MAX_CHUNK_CHARS = parseInt(process.env.LLM_DETECT_CHUNK_CHARS ?? "4500", 10);
const MAX_FILES_DEFAULT = 60;
const DETECTOR_NUM_PREDICT = parseInt(process.env.LLM_DETECT_NUM_PREDICT ?? "640", 10);

export interface LlmCodeAnalysisResult {
  findings: UnifiedFinding[];
  chunksProcessed: number;
}

export async function runLlmCodeAnalysis(srcDir: string): Promise<LlmCodeAnalysisResult> {
  if (!fs.existsSync(srcDir)) {
    console.warn(`[llm-detector] srcDir nicht gefunden: ${srcDir}`);
    return { findings: [], chunksProcessed: 0 };
  }

  const maxFiles = parseInt(process.env.LLM_DETECT_MAX_FILES ?? String(MAX_FILES_DEFAULT), 10);
  const files = collectSourceFiles(srcDir).slice(0, Math.max(1, maxFiles));

  if (files.length === 0) {
    console.warn("[llm-detector] Keine passenden Quellcode-Dateien gefunden");
    return { findings: [], chunksProcessed: 0 };
  }

  const chunks = buildChunks(files, srcDir);
  console.log(`[llm-detector] Starte Analyse für ${files.length} Dateien in ${chunks.length} Chunk(s)`);

  const all: LlmCodeFinding[] = [];

  for (const chunk of chunks) {
    console.log(`[llm-detector] Chunk ${chunk.index}/${chunks.length} gestartet (Dateien: ${chunk.files.join(", ")})`);
    const prompt = buildDetectorPrompt(chunk);
    const builtPrompt: BuiltPrompt = {
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      estimatedTokens: estimateTokens(prompt.systemPrompt) + estimateTokens(prompt.userPrompt),
      truncated: false,
      includedFindings: { axe: 0, playwright: 0, grep: 0, llm: 0 },
    };

    const result = await callOllamaDetector(builtPrompt);
    const parsed = parseJsonFindings(result.rawResponse);

    if (parsed.length > 0) {
      console.log(`[llm-detector] Chunk ${chunk.index}: ${parsed.length} Findings`);
      all.push(...parsed);
    } else {
      console.log(`[llm-detector] Chunk ${chunk.index}: keine validen Findings`);
      const preview = result.rawResponse.replace(/\s+/g, " ").slice(0, 220);
      console.log(`[llm-detector] Chunk ${chunk.index}: Response-Vorschau: ${preview}`);
    }
  }

  return { findings: normalizeLlmFindings(all, srcDir), chunksProcessed: chunks.length };
}

function buildDetectorPrompt(chunk: SourceChunk): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `Du bist ein präziser Accessibility-Reviewer für React/TypeScript.
Analysiere NUR den gegebenen Codechunk.

Ausgabeformat: Nur JSON (kein Markdown), ein Objekt mit Feld "findings".
Schema je Finding:
{
  "title": string,
  "ruleId": string,
  "wcagCriteria": string[],
  "wcagLevel": "A" | "AA" | "AAA",
  "severity": "critical" | "serious" | "moderate" | "minor",
  "category": "syntaktisch" | "semantisch" | "layout",
  "filePath": string,
  "startLine": number,
  "endLine": number,
  "evidence": string,
  "fixSuggestion": string
}

Regeln:
1. Melde nur Findings mit klarer Evidenz im Codechunk.
2. Erfinde keine Dateien oder Zeilen.
3. Wenn unsicher: nicht melden.
4. Maximal 12 Findings pro Chunk.
5. Nur JSON ausgeben.`;

  const userPrompt = `Aufgabe: Finde Barrierefreiheitsprobleme im folgenden Codechunk.
Berücksichtige WCAG-relevante Probleme bei Semantik, Keyboard, Fokus, Labels, ARIA und visuellem Kontrast nur wenn im Code direkt ableitbar.

Chunk: ${chunk.index}
Dateien im Chunk:
${chunk.files.map((f) => `- ${f}`).join("\n")}

Code:
${chunk.content}

Gib nur JSON zurück: {"findings": [...]}`;

  return { systemPrompt, userPrompt };
}

function normalizeLlmFindings(raw: LlmCodeFinding[], srcDir: string): UnifiedFinding[] {
  let counter = 0;
  const dedup = new Map<string, UnifiedFinding>();

  for (const item of raw) {
    if (!item.filePath || !item.ruleId || !item.evidence) continue;
    const safeStart = Number.isFinite(item.startLine) ? Math.max(1, item.startLine) : 1;
    const safeEnd = Number.isFinite(item.endLine) ? Math.max(safeStart, item.endLine) : safeStart;

    const key = `${item.ruleId}|${item.filePath}|${safeStart}`;
    if (dedup.has(key)) continue;

    const relative = normalizePath(item.filePath, srcDir);
    dedup.set(key, {
      id: `llm-${String(++counter).padStart(3, "0")}`,
      source: "llm",
      ruleId: item.ruleId,
      description: item.title,
      severity: item.severity,
      wcagCriteria: item.wcagCriteria,
      wcagLevel: item.wcagLevel,
      category: item.category,
      selector: null,
      componentPath: relative,
      codeSnippet: item.evidence,
      lineRange: [safeStart, safeEnd],
      rawData: {
        fixSuggestion: item.fixSuggestion,
      },
    });
  }

  const findings = [...dedup.values()];
  console.log(`[llm-detector] ${findings.length} Findings nach Deduplizierung`);
  return findings;
}

function parseJsonFindings(rawResponse: string): LlmCodeFinding[] {
  const payloads = extractJsonPayloadCandidates(rawResponse);
  for (const payload of payloads) {
    try {
      const parsed = JSON.parse(payload) as unknown;
      const normalized = normalizeParsedFindings(parsed);
      if (normalized.length > 0) return normalized;
    } catch {
      continue;
    }
  }

  const markdownFallback = parseMarkdownFindings(rawResponse);
  if (markdownFallback.length > 0) return markdownFallback;

  return [];
}

function normalizeParsedFindings(parsed: unknown): LlmCodeFinding[] {
  const findingsUnknown =
    Array.isArray(parsed) ? parsed
    : parsed && typeof parsed === "object" && Array.isArray((parsed as { findings?: unknown }).findings) ?
      (parsed as { findings: unknown[] }).findings
    : [];

  return findingsUnknown
    .map((item) => coerceLlmFinding(item))
    .filter((item): item is LlmCodeFinding => item !== null);
}

function coerceLlmFinding(value: unknown): LlmCodeFinding | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;

  const title =
    asNonEmptyString(item.title) ??
    asNonEmptyString(item.description) ??
    asNonEmptyString(item.problem);
  const ruleId = asNonEmptyString(item.ruleId) ?? asNonEmptyString(item.id) ?? buildRuleId(title ?? "finding");
  const filePath =
    asNonEmptyString(item.filePath) ??
    asNonEmptyString(item.componentPath) ??
    asNonEmptyString(item.element);
  const evidence =
    asNonEmptyString(item.evidence) ??
    asNonEmptyString(item.problem) ??
    asNonEmptyString(item.description);
  if (!title || !ruleId || !filePath || !evidence) return null;

  const wcagCriteriaFromArray = Array.isArray(item.wcagCriteria)
    ? item.wcagCriteria.filter((x): x is string => typeof x === "string")
    : [];
  const wcagCriteria = wcagCriteriaFromArray.length > 0
    ? wcagCriteriaFromArray
    : extractWcagCriteria(asString(item.wcag) || asString(item.wcagCriteria));

  const wcagLevel = coerceWcagLevel(item.wcagLevel || extractWcagLevel(asString(item.wcag)));
  const severity = coerceSeverity(item.severity);
  const category = coerceCategory(item.category || inferCategory(`${title} ${evidence}`));
  const startLine = coerceLineNumber(item.startLine ?? item.line ?? item.lineStart, 1);
  const endLine = coerceLineNumber(item.endLine ?? item.lineEnd, startLine);
  const fixSuggestion = asString(item.fixSuggestion || item.fix);

  return {
    title,
    ruleId,
    wcagCriteria,
    wcagLevel,
    severity,
    category,
    filePath,
    startLine,
    endLine,
    evidence,
    fixSuggestion,
  };
}

function parseMarkdownFindings(rawResponse: string): LlmCodeFinding[] {
  const blocks = rawResponse
    .split(/\n(?=###\s+)/g)
    .map((b) => b.trim())
    .filter((b) => b.startsWith("### "));

  const findings: LlmCodeFinding[] = [];

  for (const block of blocks) {
    const titleLine = block.split("\n")[0] ?? "";
    const title = titleLine.replace(/^###\s*/, "").trim();
    if (!title) continue;

    const bracketRule = title.match(/\[([^\]]+)\]/)?.[1]?.trim();
    const fileRaw =
      block.match(/\*\*\s*(?:Element\/Datei|Datei|File)\s*:\s*\*\*\s*([^\n]+)/i)?.[1]?.trim() ??
      block.match(/(?:Element\/Datei|Datei|File)\s*:\s*([^\n]+)/i)?.[1]?.trim();
    if (!fileRaw) continue;

    const file = parseFileAndLines(fileRaw);
    const problem =
      block.match(/\*\*\s*(?:Problem|Issue|Befund)\s*:\s*\*\*\s*([^\n]+)/i)?.[1]?.trim() ??
      block.match(/(?:Problem|Issue|Befund)\s*:\s*([^\n]+)/i)?.[1]?.trim() ??
      title;

    const fix =
      block.match(/\*\*\s*(?:Fix|Lösung|Loesung|Empfehlung)\s*:\s*\*\*\s*([^\n]+)/i)?.[1]?.trim() ??
      "";

    const wcagRaw =
      block.match(/\*\*\s*WCAG\s*:\s*\*\*\s*([^\n]+)/i)?.[1]?.trim() ??
      block.match(/WCAG\s*:\s*([^\n]+)/i)?.[1]?.trim() ??
      "";

    const severityRaw =
      block.match(/\*\*\s*(?:Schweregrad|Severity)\s*:\s*\*\*\s*([^\n]+)/i)?.[1]?.trim() ??
      block.match(/(?:Schweregrad|Severity)\s*:\s*([^\n]+)/i)?.[1]?.trim() ??
      "moderate";

    findings.push({
      title,
      ruleId: bracketRule || buildRuleId(title),
      wcagCriteria: extractWcagCriteria(wcagRaw),
      wcagLevel: coerceWcagLevel(extractWcagLevel(wcagRaw)),
      severity: coerceSeverity(severityRaw),
      category: coerceCategory(inferCategory(`${title} ${problem}`)),
      filePath: file.filePath,
      startLine: file.startLine,
      endLine: file.endLine,
      evidence: problem,
      fixSuggestion: fix,
    });
  }

  return findings;
}

function parseFileAndLines(value: string): { filePath: string; startLine: number; endLine: number } {
  const first = value.split(",")[0]?.trim() ?? value.trim();
  const m = first.match(/^(.*?):(\d+)(?:-(\d+))?$/);
  if (m) {
    const filePath = m[1].trim();
    const startLine = Number.parseInt(m[2], 10);
    const endLine = Number.parseInt(m[3] ?? m[2], 10);
    return { filePath, startLine, endLine };
  }

  return { filePath: first, startLine: 1, endLine: 1 };
}

function buildRuleId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "llm-finding";
}

function extractWcagCriteria(text: string): string[] {
  return [...new Set((text.match(/\d\.\d\.\d/g) ?? []))];
}

function extractWcagLevel(text: string): string {
  const m = text.match(/\bAAA\b|\bAA\b|\bA\b/i);
  return (m?.[0] ?? "AA").toUpperCase();
}

function inferCategory(text: string): ViolationCategory {
  const raw = text.toLowerCase();
  if (raw.includes("kontrast") || raw.includes("contrast") || raw.includes("layout")) return "layout";
  if (
    raw.includes("aria") ||
    raw.includes("label") ||
    raw.includes("semantik") ||
    raw.includes("semantic") ||
    raw.includes("fokus") ||
    raw.includes("focus") ||
    raw.includes("keyboard")
  ) {
    return "semantisch";
  }

  return "syntaktisch";
}

function extractJsonPayloadCandidates(text: string): string[] {
  const candidates: string[] = [];

  const fenced = /```json\s*([\s\S]*?)```/i.exec(text);
  if (fenced?.[1]) candidates.push(fenced[1].trim());

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(text.slice(firstBrace, lastBrace + 1));
  }

  const firstBracket = text.indexOf("[");
  const lastBracket = text.lastIndexOf("]");
  if (firstBracket >= 0 && lastBracket > firstBracket) {
    candidates.push(text.slice(firstBracket, lastBracket + 1));
  }

  candidates.push(text.trim());

  return [...new Set(candidates.filter((c) => c.length > 1))];
}

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function asNonEmptyString(value: unknown): string | null {
  const str = asString(value).trim();
  return str.length > 0 ? str : null;
}

function coerceLineNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number.parseInt(asString(value), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.floor(n));
}

function coerceWcagLevel(value: unknown): WcagLevel {
  const raw = asString(value).trim().toUpperCase();
  if (raw === "A" || raw === "AA" || raw === "AAA") return raw;
  return "AA";
}

function coerceSeverity(value: unknown): Severity {
  const raw = asString(value).trim().toLowerCase();
  if (raw === "critical" || raw === "serious" || raw === "moderate" || raw === "minor") return raw;
  if (raw === "high" || raw === "hoch") return "serious";
  if (raw === "low" || raw === "niedrig") return "minor";
  return "moderate";
}

function coerceCategory(value: unknown): ViolationCategory {
  const raw = asString(value).trim().toLowerCase();
  if (raw === "syntaktisch" || raw === "semantisch" || raw === "layout") return raw;
  if (raw === "syntactic") return "syntaktisch";
  if (raw === "semantic") return "semantisch";
  return "layout";
}

function collectSourceFiles(srcDir: string): string[] {
  const files: string[] = [];

  function walk(current: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue;
        walk(full);
      } else if (entry.isFile()) {
        if (INCLUDE_EXTENSIONS.has(path.extname(entry.name))) {
          files.push(full);
        }
      }
    }
  }

  walk(srcDir);
  files.sort();
  return files;
}

function buildChunks(files: string[], srcDir: string): SourceChunk[] {
  const chunks: SourceChunk[] = [];
  let current = "";
  let currentFiles: string[] = [];
  let chunkIndex = 1;

  for (const file of files) {
    let content: string;
    try {
      content = fs.readFileSync(file, "utf-8");
    } catch {
      continue;
    }

    const relPath = path.relative(srcDir, file).replace(/\\/g, "/");
    const numbered = content
      .split("\n")
      .map((line, idx) => `${idx + 1}: ${line}`)
      .join("\n");
    const block = `\n--- FILE: ${relPath} ---\n${numbered}\n`;

    if ((current + block).length > MAX_CHUNK_CHARS && current.length > 0) {
      chunks.push({ index: chunkIndex++, content: current, files: currentFiles });
      current = block;
      currentFiles = [relPath];
    } else {
      current += block;
      currentFiles.push(relPath);
    }
  }

  if (current.length > 0) {
    chunks.push({ index: chunkIndex, content: current, files: currentFiles });
  }

  return chunks;
}

function normalizePath(filePath: string, srcDir: string): string {
  const unified = filePath.replace(/\\/g, "/");
  if (path.isAbsolute(filePath)) {
    return path.relative(srcDir, filePath).replace(/\\/g, "/");
  }
  return unified;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}

async function callOllamaDetector(builtPrompt: BuiltPrompt): Promise<LlmResult> {
  const originalEnv = process.env.OLLAMA_NUM_PREDICT;
  process.env.OLLAMA_NUM_PREDICT = String(DETECTOR_NUM_PREDICT);
  try {
    return await callOllama(builtPrompt);
  } finally {
    if (originalEnv === undefined) {
      delete process.env.OLLAMA_NUM_PREDICT;
    } else {
      process.env.OLLAMA_NUM_PREDICT = originalEnv;
    }
  }
}
