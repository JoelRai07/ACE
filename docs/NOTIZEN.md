# ACE Notes (Current State)

## Pipeline
- Sources: axe-core, Playwright, grep, optional LLM code analysis (--llm-detect).
- Reports: Markdown + JSON per run.
- Parsing handles Must-have/Nice-to-have and severity buckets.

## Runtime Defaults
- Temperature: 0.05
- Prioritization output: OLLAMA_NUM_PREDICT (default 1536)
- Detector tuning: LLM_DETECT_NUM_PREDICT, LLM_DETECT_CHUNK_CHARS, LLM_DETECT_MAX_FILES

## Batch Runs
- Script: scripts/test.sh
- NPM alias: pnpm test:suite
- Output path: results-campaign/12er-first40/<model>/run-XX

## Next Evaluation Steps
- Main focus: 12-error suite, multiple runs per model.
- Optional: 50/100 suites only as scaling evidence.
- Metrics: runtime, parsing rate, additional useful findings from LLM detector.
