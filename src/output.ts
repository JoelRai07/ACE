/**
 * Output Formatter — schreibt Markdown + JSON Reports.
 */

import * as fs from "fs";
import * as path from "path";
import { config } from "./config.js";
import type { LlmResult } from "./ollama.js";
import type { BuiltPrompt } from "./prompt.js";

export interface FormatterInput {
  llmResult: LlmResult;
  builtPrompt: BuiltPrompt;
  targetUrl: string;
  totalFindings: { axe: number; playwright: number; grep: number };
}

export interface SavedReport {
  markdownPath: string;
  jsonPath: string;
  mustHaveCount: number;
  niceToHaveCount: number;
}

interface ParsedTodoList {
  mustHave: TodoItem[];
  niceToHave: TodoItem[];
  parseSuccess: boolean;
}

interface TodoItem {
  title: string;
  rawText: string;
}

interface AnalysisReport {
  version: "1.0";
  timestamp: string;
  targetUrl: string;
  model: string;
  stats: {
    findings: { axe: number; playwright: number; grep: number };
    includedInPrompt: { axe: number; playwright: number; grep: number };
    estimatedInputTokens: number;
    actualPromptTokens: number;
    actualOutputTokens: number;
    durationMs: number;
    tokensBudgetTruncated: boolean;
  };
  parsed: {
    success: boolean;
    mustHaveCount: number;
    niceToHaveCount: number;
  };
  rawLlmResponse: string;
}

export function formatAndSave(input: FormatterInput): SavedReport {
  const now = new Date();
  const timestamp = now.toISOString();
  const fileTimestamp = toFileTimestamp(now);
  const resultsDir = path.resolve(config.resultsDir);
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

  const markdownPath = path.join(resultsDir, `analysis-${fileTimestamp}.md`);
  const jsonPath = path.join(resultsDir, `analysis-${fileTimestamp}.json`);

  const parsed = parseMarkdownTodoList(input.llmResult.rawResponse);
  if (parsed.parseSuccess) {
    console.log(
      `[output] Parsing erfolgreich — ${parsed.mustHave.length} Must-have, ${parsed.niceToHave.length} Nice-to-have`
    );
  } else {
    console.warn(`[output] Parsing fehlgeschlagen — Rohausgabe wird gespeichert`);
  }

  const markdownContent = buildMarkdownReport(input, parsed);
  const jsonContent = buildJsonReport(input, parsed, timestamp);

  fs.writeFileSync(markdownPath, markdownContent, "utf-8");
  fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2), "utf-8");

  return {
    markdownPath,
    jsonPath,
    mustHaveCount: parsed.mustHave.length,
    niceToHaveCount: parsed.niceToHave.length,
  };
}

function buildMarkdownReport(input: FormatterInput, parsed: ParsedTodoList): string {
  const { llmResult, builtPrompt, targetUrl, totalFindings } = input;
  const ts = new Date().toISOString();
  const durationSec = (llmResult.durationMs / 1000).toFixed(1);

  const metaBlock = [
    `# Barrierefreiheits-Analyse`,
    ``,
    `| | |`,
    `|---|---|`,
    `| **URL** | ${targetUrl} |`,
    `| **Datum** | ${ts} |`,
    `| **Modell** | ${llmResult.model} |`,
    `| **Dauer** | ${durationSec}s |`,
    `| **Findings** | axe-core: ${totalFindings.axe}, Playwright: ${totalFindings.playwright}, grep: ${totalFindings.grep} |`,
    `| **Im Prompt** | axe: ${builtPrompt.includedFindings.axe}, Playwright: ${builtPrompt.includedFindings.playwright}, grep: ${builtPrompt.includedFindings.grep} |`,
    `| **Tokens (Input/Output)** | ~${builtPrompt.estimatedTokens} / ${llmResult.outputTokens} |`,
  ].join("\n");

  const truncationWarning = builtPrompt.truncated
    ? `\n> ⚠️ **Token-Budget:** Einige Findings (moderate/minor) wurden weggelassen.\n`
    : "";

  const parseWarning = !parsed.parseSuccess
    ? `\n> ⚠️ **Parsing:** Struktur der LLM-Antwort weicht vom erwarteten Format ab.\n`
    : "";

  return [
    metaBlock,
    truncationWarning,
    parseWarning,
    ``,
    `---`,
    ``,
    input.llmResult.rawResponse,
    ``,
    `---`,
    ``,
    `*Generiert mit ACE-assistant PoC · ${ts}*`,
  ]
    .join("\n")
    .trim();
}

function buildJsonReport(input: FormatterInput, parsed: ParsedTodoList, timestamp: string): AnalysisReport {
  const { llmResult, builtPrompt, targetUrl, totalFindings } = input;
  return {
    version: "1.0",
    timestamp,
    targetUrl,
    model: llmResult.model,
    stats: {
      findings: totalFindings,
      includedInPrompt: builtPrompt.includedFindings,
      estimatedInputTokens: builtPrompt.estimatedTokens,
      actualPromptTokens: llmResult.promptTokens,
      actualOutputTokens: llmResult.outputTokens,
      durationMs: llmResult.durationMs,
      tokensBudgetTruncated: builtPrompt.truncated,
    },
    parsed: {
      success: parsed.parseSuccess,
      mustHaveCount: parsed.mustHave.length,
      niceToHaveCount: parsed.niceToHave.length,
    },
    rawLlmResponse: llmResult.rawResponse,
  };
}

function parseMarkdownTodoList(markdown: string): ParsedTodoList {
  try {
    const mustHaveMatch = /^#{1,3}\s*Must-have\b/im.exec(markdown);
    const niceToHaveMatch = /^#{1,3}\s*Nice-to-have\b/im.exec(markdown);
    if (!mustHaveMatch) return { mustHave: [], niceToHave: [], parseSuccess: false };
    const mustHaveStart = mustHaveMatch.index + mustHaveMatch[0].length;
    const mustHaveEnd = niceToHaveMatch ? niceToHaveMatch.index : markdown.length;
    const niceToHaveStart = niceToHaveMatch ? niceToHaveMatch.index + niceToHaveMatch[0].length : markdown.length;
    const mustHaveSection = markdown.slice(mustHaveStart, mustHaveEnd);
    const niceToHaveSection = markdown.slice(niceToHaveStart);
    return {
      mustHave: extractItems(mustHaveSection),
      niceToHave: extractItems(niceToHaveSection),
      parseSuccess: true,
    };
  } catch {
    return { mustHave: [], niceToHave: [], parseSuccess: false };
  }
}

function extractItems(section: string): TodoItem[] {
  const parts = section.split(/^###[ \t]+/m);
  return parts.slice(1).flatMap((part) => {
    const firstNewline = part.indexOf("\n");
    const title = (firstNewline > 0 ? part.slice(0, firstNewline) : part).trim();
    const rawText = firstNewline > 0 ? part.slice(firstNewline + 1).trim() : "";
    return title ? [{ title, rawText }] : [];
  });
}

function toFileTimestamp(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
}
