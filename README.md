# ACE – Accessibility Companion (vereinfachte Nutzung)

ACE analysiert eine laufende React-Anwendung mit mehreren Quellen:
axe-core, Playwright-Checks, grep-Codepattern und optionaler LLM-Codeanalyse.
Alle Ergebnisse landen in einem Markdown- und JSON-Report.

## Setup

```bash
cd ACE
pnpm install
pnpm analyze -- --url http://localhost:xxxx --src-dir ../
```

### Praktische Skripte

| Script | Zweck |
| --- | --- |
| `pnpm analyze` | Pipeline mit Priorisierungs-LLM |
| `pnpm analyze:llm-detector` | Pipeline mit zusätzlicher LLM-Codeanalyse |
| `pnpm prompt` | Pipeline ohne LLM (Prompt wird gespeichert) |
| `pnpm axe` | Nur axe-core |
| `pnpm test:suite` | Batch-Runs via `scripts/test.sh` |
| `pnpm test:ollama` | Prüft, ob Ollama erreichbar ist |

Wichtige Umgebungsvariablen:

- `TARGET_URL`, `OLLAMA_URL`, `OLLAMA_MODEL`, `RESULTS_DIR`
- `OLLAMA_NUM_PREDICT` (Priorisierungs-Output)
- `LLM_DETECT_NUM_PREDICT`, `LLM_DETECT_CHUNK_CHARS`, `LLM_DETECT_MAX_FILES` (Detektor-Tuning)

Standardmäßig erwartet ACE einen Dev-Server unter `http://localhost:3000` und
Ollama auf `http://localhost:11434`.

## Ablauf in Kürze

1. **axe-core** scannt das DOM.
2. **Playwright** führt Interaktionschecks aus.
3. **grep** liefert Codepattern + Anreicherung.
4. **Optional**: LLM-Detektor analysiert Quellcode (`--llm-detect`).
5. **Prompt-Builder** fasst alle Findings zusammen.
6. **Ollama** erzeugt die Priorisierung, **Output** speichert Markdown + JSON.

Benötigst du nur den Prompt (z. B. für Review), nutze `pnpm prompt`.
Für Batch-Runs verwende `pnpm test:suite` und überschreibe Parameter bei Bedarf per Env-Var.

## Benchmark

Das Benchmark-Skript führt automatisiert mehrere Runs pro Modell und Test-Suite aus und erzeugt eine `summary.csv` / `summary.json`.

### Modelle und geplante Runs

| Modell | Typ | test-12 | test-50 | test-100 |
|--------|-----|---------|---------|----------|
| qwen2.5-coder:7b | Code-spezialisiert | 10 Runs | 3 Runs | 3 Runs |
| qwen2.5-coder:14b | Code-spezialisiert | 10 Runs | 3 Runs | 3 Runs |
| qwen3:32b | Generalist | 10 Runs | 3 Runs | 3 Runs |
| deepseek-r1:70b | Reasoning | 5 Runs | 3 Runs | — |

### Token-Limits pro Suite

| Suite | Violations | `num_predict` | Geschätzte Dauer/Run (7b) |
|-------|-----------|---------------|--------------------------|
| test-12 | 12 | 3.072 | ~30 min |
| test-50 | 50 | 6.144 | ~60–90 min |
| test-100 | 100 | 8.192 | ~2–3 h |

### Befehle

```bash
# Nacht 1: 12er Suite mit kleinen Modellen (10 Runs je Modell, ca. 10-13h)
pnpm benchmark --suite test-12 --models 7b,14b --runs 10

# Nacht 2: 32b + groessere Suites
pnpm benchmark --suite test-12 --models 32b --runs 10
pnpm benchmark --suite test-50 --models 7b,14b,32b --runs 3
pnpm benchmark --suite test-100 --models 7b,14b,32b --runs 3

# Nacht 3: DeepSeek R1 (langsam, daher weniger Runs)
pnpm benchmark --suite test-12 --models r1 --runs 5
pnpm benchmark --suite test-50 --models r1 --runs 3
```

### Voraussetzungen

- Ollama laeuft (`ollama serve`)
- Die jeweilige Test-App laeuft (`cd test && pnpm dev` / `cd test-50 && pnpm dev` / `cd test-100 && pnpm dev`)
- Energiesparmodus deaktiviert
