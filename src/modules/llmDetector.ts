import * as fs from "fs";
import * as path from "path";
import { callOllama } from "../ollama.js";
import type { BuiltPrompt } from "../prompt.js";
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
const MAX_CHUNK_CHARS = 9_000;
const MAX_FILES_DEFAULT = 60;

export async function runLlmCodeAnalysis(srcDir: string): Promise<UnifiedFinding[]> {
  if (!fs.existsSync(srcDir)) {
    console.warn(`[llm-detector] srcDir nicht gefunden: ${srcDir}`);
    return [];
  }

  const maxFiles = parseInt(process.env.LLM_DETECT_MAX_FILES ?? String(MAX_FILES_DEFAULT), 10);
  const files = collectSourceFiles(srcDir).slice(0, Math.max(1, maxFiles));

  if (files.length === 0) {
    console.warn("[llm-detector] Keine passenden Quellcode-Dateien gefunden");
    return [];
  }

  const chunks = buildChunks(files, srcDir);
  console.log(`[llm-detector] Starte Analyse für ${files.length} Dateien in ${chunks.length} Chunk(s)`);

  const all: LlmCodeFinding[] = [];

  for (const chunk of chunks) {
    const prompt = buildDetectorPrompt(chunk);
    const builtPrompt: BuiltPrompt = {
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      estimatedTokens: estimateTokens(prompt.systemPrompt) + estimateTokens(prompt.userPrompt),
      truncated: false,
      includedFindings: { axe: 0, playwright: 0, grep: 0, llm: 0 },
    };

    const result = await callOllama(builtPrompt);
    const parsed = parseJsonFindings(result.rawResponse);

    if (parsed.length > 0) {
      console.log(`[llm-detector] Chunk ${chunk.index}: ${parsed.length} Findings`);
      all.push(...parsed);
    } else {
      console.log(`[llm-detector] Chunk ${chunk.index}: keine validen Findings`);
    }
  }

  return normalizeLlmFindings(all, srcDir);
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
  const jsonPayload = extractJsonObject(rawResponse);
  if (!jsonPayload) return [];

  try {
    const parsed = JSON.parse(jsonPayload) as { findings?: unknown };
    if (!Array.isArray(parsed.findings)) return [];
    return parsed.findings.filter(isLlmFindingLike) as LlmCodeFinding[];
  } catch {
    return [];
  }
}

function isLlmFindingLike(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.title === "string" &&
    typeof item.ruleId === "string" &&
    Array.isArray(item.wcagCriteria) &&
    typeof item.wcagLevel === "string" &&
    typeof item.severity === "string" &&
    typeof item.category === "string" &&
    typeof item.filePath === "string" &&
    typeof item.startLine === "number" &&
    typeof item.endLine === "number" &&
    typeof item.evidence === "string" &&
    typeof item.fixSuggestion === "string"
  );
}

function extractJsonObject(text: string): string | null {
  const fenced = /```json\s*([\s\S]*?)```/i.exec(text);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace <= firstBrace) return null;
  return text.slice(firstBrace, lastBrace + 1);
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
