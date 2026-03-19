/**
 * Pipeline-Orchestrierung
 *
 * Verkettet alle Schritte der Barrierefreiheits-Analysepipeline:
 *   1. axe-core  → Collect → Normalize
 *   2. Playwright → Collect → Normalize
 *   3. grep       → Enrich (bestehende Findings) + Collect (Pattern-Findings) → Normalize
 *   4. Prompt Builder  → Token-Budget prüfen
 *   5. Ollama Client   → LLM-Aufruf
 *   6. Formatter       → Markdown + JSON speichern
 *
 * CLI-Flags:
 *   --url <url>         Ziel-URL (default: config.targetUrl)
 *   --src-dir <path>    Pfad zum src/-Verzeichnis der React-App (für grep-Anreicherung)
 *   --skip-llm          Prompt in results/ speichern, Ollama-Aufruf überspringen
 *   --axe-only          Nur axe-core ausführen (schneller Test)
 */

import { runAxeAnalysis } from "./modules/axe.js";
import { runPlaywrightChecks } from "./modules/playwright.js";
import { enrichWithCodeContext, runGrepPatterns } from "./modules/code.js";
import { buildPrompt } from "./prompt.js";
import { callOllama } from "./ollama.js";
import { formatAndSave } from "./output.js";
import { config } from "./config.js";
import type { UnifiedFinding } from "./types.js";
import * as fs from "fs";
import * as path from "path";

// ── CLI-Argument-Parser ───────────────────────────────────────────────────

interface CliArgs {
  url: string;
  srcDir: string | null;
  skipLlm: boolean;
  axeOnly: boolean;
}

function parseArgs(): CliArgs {
  const argv = process.argv.slice(2);
  const args: CliArgs = {
    url: config.targetUrl,
    srcDir: null,
    skipLlm: false,
    axeOnly: false,
  };

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--":
        continue;
      case "--url":
        args.url = argv[++i] ?? args.url;
        break;
      case "--src-dir":
        args.srcDir = argv[++i] ?? null;
        break;
      case "--skip-llm":
        args.skipLlm = true;
        break;
      case "--axe-only":
        args.axeOnly = true;
        break;
      default:
        if (argv[i]?.startsWith("--")) {
          console.warn(`[pipeline] Unbekanntes Flag: ${argv[i]}`);
        }
    }
  }

  return args;
}

// ── Hilfsfunktionen ───────────────────────────────────────────────────────

function printBanner(url: string, flags: Omit<CliArgs, "url">): void {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║   ACE-assistant — Barrierefreiheits-Analysepipeline  ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`  Ziel:     ${url}`);
  console.log(`  Modell:   ${config.ollamaModel}`);
  if (flags.srcDir) console.log(`  src-dir:  ${flags.srcDir}`);
  if (flags.skipLlm) console.log(`  Modus:    --skip-llm (kein Ollama-Aufruf)`);
  if (flags.axeOnly) console.log(`  Modus:    --axe-only`);
  console.log();
}

function printSectionHeader(title: string): void {
  console.log(`\n── ${title} ${"─".repeat(Math.max(0, 52 - title.length))}`);
}

function printSummary(
  findings: { axe: UnifiedFinding[]; playwright: UnifiedFinding[]; grep: UnifiedFinding[] },
  savedPaths: { markdownPath: string; jsonPath: string } | null,
  startMs: number
): void {
  const totalMs = Date.now() - startMs;
  const totalFindings = findings.axe.length + findings.playwright.length + findings.grep.length;
  const critical = [...findings.axe, ...findings.playwright, ...findings.grep].filter(
    (f) => f.severity === "critical"
  ).length;
  const serious = [...findings.axe, ...findings.playwright, ...findings.grep].filter(
    (f) => f.severity === "serious"
  ).length;

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║                  Analyse abgeschlossen               ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`  Findings gesamt:  ${totalFindings}`);
  console.log(`    axe-core:       ${findings.axe.length}`);
  console.log(`    Playwright:     ${findings.playwright.length}`);
  console.log(`    grep-Pattern:   ${findings.grep.length}`);
  console.log(`  Kritisch:         ${critical} critical, ${serious} serious`);
  console.log(`  Gesamtdauer:      ${(totalMs / 1000).toFixed(1)}s`);
  if (savedPaths) {
    console.log(`\n  📄 Markdown:  ${savedPaths.markdownPath}`);
    console.log(`  📊 JSON:      ${savedPaths.jsonPath}`);
  }
  console.log();
}

// ── Prompt-Datei speichern (--skip-llm) ──────────────────────────────────

function savePromptToDisk(systemPrompt: string, userPrompt: string): void {
  const resultsDir = path.resolve(config.resultsDir);
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const promptPath = path.join(resultsDir, `prompt-${ts}.txt`);
  const content = `=== SYSTEM PROMPT ===\n\n${systemPrompt}\n\n=== USER PROMPT ===\n\n${userPrompt}`;
  fs.writeFileSync(promptPath, content, "utf-8");
  console.log(`[pipeline] Prompt gespeichert: ${promptPath}`);
}

// ── Pipeline ──────────────────────────────────────────────────────────────

async function run(): Promise<void> {
  const startMs = Date.now();
  const args = parseArgs();
  printBanner(args.url, { srcDir: args.srcDir, skipLlm: args.skipLlm, axeOnly: args.axeOnly });

  // ── Schritt 1: axe-core ────────────────────────────────────────────────
  printSectionHeader("axe-core");
  const axeFindings = await runAxeAnalysis(args.url);

  if (args.axeOnly) {
    console.log("\n[pipeline] --axe-only: Pipeline nach axe-core beendet.");
    printSummary({ axe: axeFindings, playwright: [], grep: [] }, null, startMs);
    return;
  }

  // ── Schritt 2: Playwright ──────────────────────────────────────────────
  printSectionHeader("Playwright Checks");
  const pwFindings = await runPlaywrightChecks(args.url);

  // ── Schritt 3: grep — Anreicherung + Pattern-Findings ─────────────────
  const allFindings = [...axeFindings, ...pwFindings];

  if (args.srcDir) {
    printSectionHeader("Code-Anreicherung");
    await enrichWithCodeContext(allFindings, args.srcDir);

    printSectionHeader("grep Pattern-Findings");
    const grepFindings = await runGrepPatterns(args.srcDir);

    // ── Schritt 4: Prompt Builder ────────────────────────────────────────
    printSectionHeader("Prompt Builder");
    const builtPrompt = buildPrompt({
      axeFindings,
      playwrightFindings: pwFindings,
      grepFindings,
      targetUrl: args.url,
    });

    const totalFindings = {
      axe: axeFindings.length,
      playwright: pwFindings.length,
      grep: grepFindings.length,
    };

    await finishPipeline(args, builtPrompt, totalFindings, { axe: axeFindings, playwright: pwFindings, grep: grepFindings }, startMs);
  } else {
    // Ohne srcDir: kein grep
    console.log("[pipeline] Kein --src-dir angegeben — grep-Phase übersprungen.");

    printSectionHeader("Prompt Builder");
    const builtPrompt = buildPrompt({
      axeFindings,
      playwrightFindings: pwFindings,
      grepFindings: [],
      targetUrl: args.url,
    });

    const totalFindings = { axe: axeFindings.length, playwright: pwFindings.length, grep: 0 };
    await finishPipeline(args, builtPrompt, totalFindings, { axe: axeFindings, playwright: pwFindings, grep: [] }, startMs);
  }
}

async function finishPipeline(
  args: CliArgs,
  builtPrompt: ReturnType<typeof buildPrompt>,
  totalFindings: { axe: number; playwright: number; grep: number },
  allFindings: { axe: UnifiedFinding[]; playwright: UnifiedFinding[]; grep: UnifiedFinding[] },
  startMs: number
): Promise<void> {
  // ── Schritt 5: Ollama ────────────────────────────────────────────────
  if (args.skipLlm) {
    printSectionHeader("Prompt speichern (--skip-llm)");
    savePromptToDisk(builtPrompt.systemPrompt, builtPrompt.userPrompt);
    printSummary(allFindings, null, startMs);
    return;
  }

  printSectionHeader("Ollama LLM");
  const llmResult = await callOllama(builtPrompt);

  // ── Schritt 6: Formatter ──────────────────────────────────────────────
  printSectionHeader("Output Formatter");
  const saved = formatAndSave({
    llmResult,
    builtPrompt,
    targetUrl: args.url,
    totalFindings,
  });

  printSummary(allFindings, saved, startMs);
}

// ── Einstiegspunkt ────────────────────────────────────────────────────────

run().catch((err) => {
  console.error("\n[pipeline] Fataler Fehler:", err instanceof Error ? err.message : String(err));
  if (err instanceof Error && err.stack) {
    console.error(err.stack.split("\n").slice(1, 4).join("\n"));
  }
  process.exit(1);
});
