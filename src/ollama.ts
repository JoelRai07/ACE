/** Ollama Client — kapselt den HTTP-Aufruf zum lokalen Modell. */

import http from "node:http";
import https from "node:https";
import { URL } from "node:url";
import { config } from "./config.js";
import type { BuiltPrompt } from "./prompt.js";

export interface LlmResult {
  rawResponse: string;
  model: string;
  durationMs: number;
  promptTokens: number;
  outputTokens: number;
}

interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  total_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

interface OllamaTagsResponse {
  models: Array<{ name: string }>;
}

interface ErrorWithCause extends Error {
  cause?: unknown;
}

interface SimpleResponse {
  ok: boolean;
  status: number;
  statusText: string;
  text(): Promise<string>;
  json<T>(): Promise<T>;
}

const REQUEST_TIMEOUT_MS = config.ollamaTimeoutMs;
const DEFAULT_NUM_PREDICT = 1536;

function getNumPredict(): number {
  const raw = process.env.OLLAMA_NUM_PREDICT;
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_NUM_PREDICT;
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_NUM_PREDICT;
  return parsed;
}

export async function callOllama(builtPrompt: BuiltPrompt): Promise<LlmResult> {
  const endpoint = `${config.ollamaUrl}/api/generate`;
  const startMs = Date.now();
  const progress = createOllamaProgressTimer(startMs);

  const requestBody = {
    model: config.ollamaModel,
    prompt: builtPrompt.userPrompt,
    system: builtPrompt.systemPrompt,
    stream: false,
    think: false,
    options: {
      temperature: 0.05,
      num_predict: getNumPredict(),
    },
  };

  console.log(`[ollama] Sende Prompt an ${config.ollamaModel} …`);
  progress.start();

  let response: SimpleResponse;
  try {
    response = await requestWithTimeout(
      endpoint,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      },
      REQUEST_TIMEOUT_MS,
    );
  } finally {
    progress.stop();
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "(kein Body)");
    throw new Error(`Ollama HTTP ${response.status}: ${response.statusText}\nBody: ${body.slice(0, 500)}`);
  }

  const data = await response.json<OllamaGenerateResponse>();

  if (!data.response || !data.done) {
    throw new Error(`Unerwartete Ollama-Antwort: done=${String(data.done)}, response=${data.response?.slice(0, 80)}`);
  }

  const durationMs = Date.now() - startMs;
  const outputTokens = data.eval_count ?? 0;
  const promptTokens = data.prompt_eval_count ?? 0;

  console.log(
    `[ollama] Fertig in ${(durationMs / 1000).toFixed(1)}s — ${promptTokens} Prompt-Tokens, ${outputTokens} Output-Tokens`,
  );

  return {
    rawResponse: data.response,
    model: data.model,
    durationMs,
    promptTokens,
    outputTokens,
  };
}

function createOllamaProgressTimer(startMs: number): { start: () => void; stop: () => void } {
  let intervalId: NodeJS.Timeout | null = null;
  let lastLineLength = 0;

  const render = () => {
    const elapsed = formatElapsed(Date.now() - startMs);
    const line = `[ollama] Laufzeit aktueller Try: ${elapsed}`;

    if (process.stdout.isTTY) {
      const paddedLine = line.padEnd(lastLineLength, " ");
      process.stdout.write(`\r${paddedLine}`);
      lastLineLength = paddedLine.length;
    } else {
      console.log(line);
    }
  };

  return {
    start: () => {
      render();
      intervalId = setInterval(render, 1000);
    },
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      if (process.stdout.isTTY && lastLineLength > 0) {
        process.stdout.write(`\r${" ".repeat(lastLineLength)}\r`);
      }
    },
  };
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

export async function testConnection(): Promise<void> {
  const tagsUrl = `${config.ollamaUrl}/api/tags`;
  console.log(`[ollama] Verbindungstest: ${tagsUrl}`);
  const response = await requestWithTimeout(tagsUrl, { method: "GET" }, 10_000);
  if (!response.ok) {
    throw new Error(`Ollama /api/tags: HTTP ${response.status}`);
  }
  const data = await response.json<OllamaTagsResponse>();
  const availableModels = data.models.map((m) => m.name);
  if (
    !availableModels.some((name) => name === config.ollamaModel || name.startsWith(config.ollamaModel.split(":")[0]))
  ) {
    throw new Error(
      `Modell "${config.ollamaModel}" nicht gefunden.\n` +
        `Lade es mit: ollama pull ${config.ollamaModel}\nVerfügbar: ${availableModels.join(", ")}`,
    );
  }
  console.log(`[ollama] ✓ Modell "${config.ollamaModel}" ist bereit.`);

  const generateUrl = `${config.ollamaUrl}/api/generate`;
  console.log(`[ollama] Generierungstest: ${generateUrl}`);
  const generateResponse = await requestWithTimeout(
    generateUrl,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.ollamaModel,
        prompt: "Antworte nur mit OK.",
        stream: false,
        think: false,
        options: {
          temperature: 0,
          num_predict: 64,
        },
      }),
    },
    3 * 60_000,
  );

  if (!generateResponse.ok) {
    const body = await generateResponse.text().catch(() => "(kein Body)");
    throw new Error(`Ollama /api/generate: HTTP ${generateResponse.status}\nBody: ${body.slice(0, 500)}`);
  }

  const generateData = await generateResponse.json<OllamaGenerateResponse>();
  if (!generateData.done || !generateData.response) {
    throw new Error(
      `Ollama /api/generate lieferte keine nutzbare Antwort: done=${String(generateData.done)}, ` +
        `response=${generateData.response?.slice(0, 80)}`,
    );
  }

  console.log(`[ollama] ✓ Generierung funktioniert (${generateData.response.trim().slice(0, 80)})`);
}

async function requestWithTimeout(
  url: string,
  options: { method: string; headers?: Record<string, string>; body?: string },
  timeoutMs: number,
): Promise<SimpleResponse> {
  const parsedUrl = new URL(url);
  const transport = parsedUrl.protocol === "https:" ? https : http;

  return await new Promise<SimpleResponse>((resolve, reject) => {
    const request = transport.request(
      parsedUrl,
      {
        method: options.method,
        headers: options.headers,
      },
      (response) => {
        const chunks: Buffer[] = [];

        response.on("data", (chunk: Buffer | string) => {
          chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
        });

        response.on("end", () => {
          clearTimeout(timeoutId);
          const rawBody = Buffer.concat(chunks).toString("utf8");

          resolve({
            ok: (response.statusCode ?? 0) >= 200 && (response.statusCode ?? 0) < 300,
            status: response.statusCode ?? 0,
            statusText: response.statusMessage ?? "",
            text: async () => rawBody,
            json: async <T>() => JSON.parse(rawBody) as T,
          });
        });
      },
    );

    const timeoutId = setTimeout(() => {
      request.destroy(
        new Error(
          `Ollama-Anfrage abgebrochen nach ${timeoutMs / 1000}s Timeout. Läuft "${config.ollamaModel}" bereits? ` +
            `Prüfe mit: ollama list`,
        ),
      );
    }, timeoutMs);

    request.on("error", (err: ErrorWithCause) => {
      clearTimeout(timeoutId);

      if (err.message.includes("Timeout")) {
        reject(err);
        return;
      }

      const causeMessage =
        err.cause instanceof Error ? err.cause.message
        : err.cause ? String(err.cause)
        : "";
      const details = causeMessage ? `\nUrsache: ${causeMessage}` : "";

      reject(
        new Error(`Ollama nicht erreichbar unter ${url}. Starte Ollama mit: ollama serve\n${err.message}${details}`),
      );
    });

    if (options.body) {
      request.write(options.body);
    }

    request.end();
  });
}

if (require.main === module) {
  testConnection()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[ollama] Fehler:", err instanceof Error ? err.message : err);
      process.exit(1);
    });
}
