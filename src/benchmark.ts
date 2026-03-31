/**
 * Benchmark-Skript fuer ACE-PoC
 *
 * Konfigurierbar via CLI-Argumente:
 *   pnpm benchmark                          # Alles (Standard-Config)
 *   pnpm benchmark --suite test-12          # Nur 12er Suite
 *   pnpm benchmark --models 7b,14b         # Nur bestimmte Modelle
 *   pnpm benchmark --runs 5                # 5 statt 10 Wiederholungen
 *   pnpm benchmark --suite test-12 --runs 10 --models 7b,14b,32b
 *
 * Voraussetzungen:
 *   - Gewuenschte Modelle in Ollama geladen (ollama pull <model>)
 *   - Gewuenschte Test-Apps laufen (ports 5173, 5174, 5175)
 */

import { execSync, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

// ── Konfiguration ────────────────────────────────────────────────────────

const ALL_MODELS: Record<string, string> = {
  "7b": "qwen2.5-coder:7b",
  "14b": "qwen2.5-coder:14b",
  "32b": "qwen3:32b",
  "70b": "deepseek-r1:70b",
};

interface SuiteConfig {
  name: string;
  url: string;
  srcDir: string;
  violations: number;
  numPredict: number; // Token-Limit pro Suite
}

const ALL_SUITES: Record<string, SuiteConfig> = {
  "test-12": {
    name: "test-12",
    url: "http://localhost:5173",
    srcDir: "./test/src",
    violations: 12,
    numPredict: 3072,
  },
  "test-50": {
    name: "test-50",
    url: "http://localhost:5174",
    srcDir: "./test-50/src",
    violations: 50,
    numPredict: 6144,
  },
  "test-100": {
    name: "test-100",
    url: "http://localhost:5175",
    srcDir: "./test-100/src",
    violations: 100,
    numPredict: 8192,
  },
};

const DEFAULT_RUNS = 10;
const BENCHMARK_DIR = "./results/benchmark";
const DEFAULT_LLM_DETECT_NUM_PREDICT = "400";
const DEFAULT_LLM_DETECT_CHUNK_CHARS = "3000";
const DEFAULT_LLM_DETECT_MAX_FILES = "25";

// ── CLI-Parser ───────────────────────────────────────────────────────────

interface BenchmarkConfig {
  models: string[];
  suites: SuiteConfig[];
  runs: number;
}

function parseCliArgs(): BenchmarkConfig {
  const argv = process.argv.slice(2);
  let models: string[] | null = null;
  let suiteNames: string[] | null = null;
  let runs = DEFAULT_RUNS;

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--models":
        models = (argv[++i] ?? "").split(",").map((m) => m.trim());
        break;
      case "--suite":
        suiteNames = (argv[++i] ?? "").split(",").map((s) => s.trim());
        break;
      case "--runs":
        runs = parseInt(argv[++i] ?? "10", 10);
        break;
    }
  }

  // Modelle aufloesen
  const resolvedModels: string[] = [];
  if (models) {
    for (const key of models) {
      const full = ALL_MODELS[key] ?? Object.values(ALL_MODELS).find((m) => m.includes(key));
      if (full) resolvedModels.push(full);
      else console.warn(`[benchmark] Unbekanntes Modell: ${key} — uebersprungen`);
    }
  } else {
    resolvedModels.push(...Object.values(ALL_MODELS));
  }

  // Suites aufloesen
  const resolvedSuites: SuiteConfig[] = [];
  if (suiteNames) {
    for (const name of suiteNames) {
      const suite = ALL_SUITES[name];
      if (suite) resolvedSuites.push(suite);
      else console.warn(`[benchmark] Unbekannte Suite: ${name} — uebersprungen`);
    }
  } else {
    resolvedSuites.push(...Object.values(ALL_SUITES));
  }

  return { models: resolvedModels, suites: resolvedSuites, runs };
}

// ── Hilfsfunktionen ──────────────────────────────────────────────────────

function sanitizeModelName(model: string): string {
  return model.replace(/[/:]/g, "-");
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function checkPort(url: string): boolean {
  try {
    execSync(`curl -s -o /dev/null -w "%{http_code}" ${url}`, {
      timeout: 5000,
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

function checkOllamaModels(): string[] {
  try {
    const output = execSync("ollama list", { encoding: "utf-8", timeout: 10000 });
    return output.split("\n").map((l) => l.split(/\s+/)[0]).filter(Boolean);
  } catch {
    return [];
  }
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

interface RunResult {
  model: string;
  suite: string;
  run: number;
  success: boolean;
  parseSuccess: boolean;
  mustHaveCount: number;
  niceToHaveCount: number;
  durationMs: number;
  promptTokens: number;
  outputTokens: number;
  findingsAxe: number;
  findingsPlaywright: number;
  findingsGrep: number;
  findingsLlm: number;
  numPredict: number;
  error?: string;
}

function readResultJson(resultsDir: string): Partial<RunResult> {
  try {
    const files = fs.readdirSync(resultsDir).filter((f) => f.endsWith(".json"));
    if (files.length === 0) return { success: false, error: "Keine JSON-Datei gefunden" };

    const jsonPath = path.join(resultsDir, files[files.length - 1]);
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    return {
      success: true,
      parseSuccess: data.parsed?.success ?? false,
      mustHaveCount: data.parsed?.mustHaveCount ?? 0,
      niceToHaveCount: data.parsed?.niceToHaveCount ?? 0,
      durationMs: data.stats?.durationMs ?? 0,
      promptTokens: data.stats?.actualPromptTokens ?? 0,
      outputTokens: data.stats?.actualOutputTokens ?? 0,
      findingsAxe: data.stats?.findings?.axe ?? 0,
      findingsPlaywright: data.stats?.findings?.playwright ?? 0,
      findingsGrep: data.stats?.findings?.grep ?? 0,
      findingsLlm: data.stats?.findings?.llm ?? 0,
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ── Preflight ────────────────────────────────────────────────────────────

function preflight(config: BenchmarkConfig): boolean {
  console.log("=== PREFLIGHT CHECKS ===\n");
  let ok = true;

  for (const suite of config.suites) {
    const reachable = checkPort(suite.url);
    const status = reachable ? "OK" : "FEHLT";
    console.log(`  [${status}] ${suite.name} auf ${suite.url} (numPredict: ${suite.numPredict})`);
    if (!reachable) ok = false;
  }

  const available = checkOllamaModels();
  for (const model of config.models) {
    const found = available.some(
      (a) => a === model || a.startsWith(model.split(":")[0]),
    );
    const status = found ? "OK" : "FEHLT";
    console.log(`  [${status}] Modell: ${model}`);
    if (!found) ok = false;
  }

  const totalRuns = config.models.length * config.suites.length * config.runs;
  console.log(`\n  Geplante Runs: ${totalRuns} (${config.models.length} Modelle x ${config.suites.length} Suites x ${config.runs} Runs)`);
  console.log(`  Ergebnis-Verzeichnis: ${path.resolve(BENCHMARK_DIR)}\n`);

  return ok;
}

// ── Einzelner Run ────────────────────────────────────────────────────────

function executeRun(
  model: string,
  suite: SuiteConfig,
  runNumber: number,
): RunResult {
  const modelDir = sanitizeModelName(model);
  const runDir = path.join(BENCHMARK_DIR, modelDir, suite.name, `run-${String(runNumber).padStart(2, "0")}`);
  ensureDir(runDir);

  const env = {
    ...process.env,
    OLLAMA_MODEL: model,
    RESULTS_DIR: runDir,
    OLLAMA_NUM_PREDICT: String(suite.numPredict),
    LLM_DETECT_NUM_PREDICT: process.env.LLM_DETECT_NUM_PREDICT ?? DEFAULT_LLM_DETECT_NUM_PREDICT,
    LLM_DETECT_CHUNK_CHARS: process.env.LLM_DETECT_CHUNK_CHARS ?? DEFAULT_LLM_DETECT_CHUNK_CHARS,
    LLM_DETECT_MAX_FILES: process.env.LLM_DETECT_MAX_FILES ?? DEFAULT_LLM_DETECT_MAX_FILES,
  };

  const startMs = Date.now();

  const result = spawnSync(
    "npx",
    ["tsx", "src/index.ts", "--url", suite.url, "--src-dir", suite.srcDir, "--llm-detect"],
    {
      env,
      cwd: process.cwd(),
      timeout: 4 * 60 * 60 * 1000, // 4h max
      stdio: "pipe",
      encoding: "utf-8",
      shell: true,
    },
  );

  const wallTimeMs = Date.now() - startMs;

  if (result.status !== 0) {
    const errSnippet = (result.stderr || result.stdout || "").slice(-500);
    return {
      model,
      suite: suite.name,
      run: runNumber,
      success: false,
      parseSuccess: false,
      mustHaveCount: 0,
      niceToHaveCount: 0,
      durationMs: wallTimeMs,
      promptTokens: 0,
      outputTokens: 0,
      findingsAxe: 0,
      findingsPlaywright: 0,
      findingsGrep: 0,
      findingsLlm: 0,
      numPredict: suite.numPredict,
      error: errSnippet,
    };
  }

  const parsed = readResultJson(runDir);
  return {
    model,
    suite: suite.name,
    run: runNumber,
    success: parsed.success ?? false,
    parseSuccess: parsed.parseSuccess ?? false,
    mustHaveCount: parsed.mustHaveCount ?? 0,
    niceToHaveCount: parsed.niceToHaveCount ?? 0,
    durationMs: parsed.durationMs ?? wallTimeMs,
    promptTokens: parsed.promptTokens ?? 0,
    outputTokens: parsed.outputTokens ?? 0,
    findingsAxe: parsed.findingsAxe ?? 0,
    findingsPlaywright: parsed.findingsPlaywright ?? 0,
    findingsGrep: parsed.findingsGrep ?? 0,
    findingsLlm: parsed.findingsLlm ?? 0,
    numPredict: suite.numPredict,
  };
}

// ── Summary-Export ────────────────────────────────────────────────────────

function writeSummary(results: RunResult[], config: BenchmarkConfig): void {
  const summaryDir = path.resolve(BENCHMARK_DIR);
  ensureDir(summaryDir);

  // CSV
  const csvHeader = [
    "model", "suite", "run", "success", "parseSuccess",
    "mustHaveCount", "niceToHaveCount", "durationMs",
    "promptTokens", "outputTokens", "numPredict",
    "findingsAxe", "findingsPlaywright", "findingsGrep", "findingsLlm", "error",
  ].join(",");

  const csvRows = results.map((r) =>
    [
      r.model, r.suite, r.run, r.success, r.parseSuccess,
      r.mustHaveCount, r.niceToHaveCount, r.durationMs,
      r.promptTokens, r.outputTokens, r.numPredict,
      r.findingsAxe, r.findingsPlaywright, r.findingsGrep, r.findingsLlm,
      `"${(r.error ?? "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
    ].join(","),
  );

  const csvPath = path.join(summaryDir, "summary.csv");
  fs.writeFileSync(csvPath, [csvHeader, ...csvRows].join("\n"), "utf-8");

  // JSON
  const jsonPath = path.join(summaryDir, "summary.json");
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), "utf-8");

  // Aggregierte Statistiken
  console.log("\n--- Zwischenstand ---");
  for (const model of config.models) {
    for (const suite of config.suites) {
      const runs = results.filter((r) => r.model === model && r.suite === suite.name);
      if (runs.length === 0) continue;
      const successful = runs.filter((r) => r.success);
      const parsed = runs.filter((r) => r.parseSuccess);
      const avgDuration = successful.length > 0
        ? Math.round(successful.reduce((s, r) => s + r.durationMs, 0) / successful.length / 1000)
        : 0;
      const avgOutput = successful.length > 0
        ? Math.round(successful.reduce((s, r) => s + r.outputTokens, 0) / successful.length)
        : 0;

      console.log(
        `  ${sanitizeModelName(model).padEnd(22)} | ${suite.name.padEnd(8)} | ` +
        `${successful.length}/${runs.length} OK | ` +
        `${parsed.length}/${runs.length} parsed | ` +
        `avg ${avgDuration}s | ` +
        `avg ${avgOutput} out-tokens`,
      );
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const config = parseCliArgs();

  const totalRuns = config.models.length * config.suites.length * config.runs;
  console.log("╔═══════════════════════════════════════════╗");
  console.log(`║   ACE Benchmark — ${totalRuns} Runs geplant`.padEnd(44) + "║");
  console.log("╚═══════════════════════════════════════════╝\n");

  const ok = preflight(config);
  if (!ok) {
    console.error("\n[benchmark] Preflight fehlgeschlagen. Bitte fehlende Dienste/Modelle starten.");
    console.error("  Test-Apps: cd test && npm run dev | cd test-50 && npm run dev | cd test-100 && npm run dev");
    console.error("  Modelle:   ollama pull <model>");
    process.exit(1);
  }

  const results: RunResult[] = [];
  let completed = 0;
  const benchmarkStart = Date.now();

  for (const model of config.models) {
    for (const suite of config.suites) {
      for (let run = 1; run <= config.runs; run++) {
        completed++;
        const elapsed = formatDuration(Date.now() - benchmarkStart);
        const progress = `[${completed}/${totalRuns}]`;
        console.log(
          `\n${progress} ${model} | ${suite.name} ` +
          `(numPredict: ${suite.numPredict}, llmDetect: ${process.env.LLM_DETECT_NUM_PREDICT ?? DEFAULT_LLM_DETECT_NUM_PREDICT}/${process.env.LLM_DETECT_CHUNK_CHARS ?? DEFAULT_LLM_DETECT_CHUNK_CHARS}/${process.env.LLM_DETECT_MAX_FILES ?? DEFAULT_LLM_DETECT_MAX_FILES}) ` +
          `| Run ${run}/${config.runs} | Elapsed: ${elapsed}`,
        );
        console.log("-".repeat(70));

        const result = executeRun(model, suite, run);
        results.push(result);

        if (result.success) {
          console.log(
            `  => OK | ${formatDuration(result.durationMs)} | ` +
            `${result.promptTokens} prompt / ${result.outputTokens} output tokens | ` +
            `parsed: ${result.parseSuccess} | must: ${result.mustHaveCount} nice: ${result.niceToHaveCount}`,
          );
        } else {
          console.log(`  => FEHLER: ${result.error?.slice(0, 200)}`);
        }

        writeSummary(results, config);
      }
    }
  }

  const totalElapsed = formatDuration(Date.now() - benchmarkStart);
  console.log(`\n${"=".repeat(70)}`);
  console.log(`=== BENCHMARK ABGESCHLOSSEN — ${totalElapsed} Gesamtdauer ===`);
  console.log(`${"=".repeat(70)}`);
  writeSummary(results, config);
  console.log(`\n[benchmark] Ergebnisse: ${path.resolve(BENCHMARK_DIR)}/summary.csv`);
}

main().catch((err) => {
  console.error("[benchmark] Fataler Fehler:", err);
  process.exit(1);
});
