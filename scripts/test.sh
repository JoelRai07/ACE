#!/usr/bin/env bash
set -euo pipefail

RUNS_PER_CONDITION="${RUNS_PER_CONDITION:-3}"
MODEL="${MODEL:-qwen2.5-coder:7b}"
APP_DIR="${APP_DIR:-test}"
APP_SRC_DIR="${APP_SRC_DIR:-test/src}"
BASE_URL="${BASE_URL:-http://127.0.0.1:4173}"
OUT_ROOT="${OUT_ROOT:-results-campaign/12er-first40}"
ANALYZE_SCRIPT="${ANALYZE_SCRIPT:-analyze:llm-detector}"
RUN_TIMEOUT_SEC="${RUN_TIMEOUT_SEC:-2400}"
CONTINUE_ON_ERROR="${CONTINUE_ON_ERROR:-1}"

# Sensible defaults for faster/stabler unattended LLM runs
OLLAMA_NUM_PREDICT="${OLLAMA_NUM_PREDICT:-1024}"
LLM_DETECT_NUM_PREDICT="${LLM_DETECT_NUM_PREDICT:-400}"
LLM_DETECT_CHUNK_CHARS="${LLM_DETECT_CHUNK_CHARS:-3000}"
LLM_DETECT_MAX_FILES="${LLM_DETECT_MAX_FILES:-25}"

MODEL_DIR="$(echo "$MODEL" | tr '/: ' '___')"
RESULTS_ROOT="$OUT_ROOT/$MODEL_DIR"
FAIL_COUNT=0

wait_for_url() {
  local url="$1"
  local timeout_sec="${2:-120}"
  local start_ts
  start_ts="$(date +%s)"

  while true; do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi

    if (( $(date +%s) - start_ts >= timeout_sec )); then
      echo "[error] Dev-Server unter $url wurde nicht rechtzeitig erreichbar." >&2
      return 1
    fi

    sleep 1
  done
}

run_one() {
  local run_number="$1"

  local run_dir
  run_dir="$RESULTS_ROOT/run-$(printf '%02d' "$run_number")"
  mkdir -p "$run_dir"

  echo "[run-$run_number] npm run $ANALYZE_SCRIPT -- --url $BASE_URL --src-dir $APP_SRC_DIR (timeout=${RUN_TIMEOUT_SEC}s)"

  if timeout --foreground "${RUN_TIMEOUT_SEC}s" \
    env RESULTS_DIR="$run_dir" TARGET_URL="$BASE_URL" OLLAMA_MODEL="$MODEL" \
    OLLAMA_NUM_PREDICT="$OLLAMA_NUM_PREDICT" LLM_DETECT_NUM_PREDICT="$LLM_DETECT_NUM_PREDICT" \
    LLM_DETECT_CHUNK_CHARS="$LLM_DETECT_CHUNK_CHARS" LLM_DETECT_MAX_FILES="$LLM_DETECT_MAX_FILES" \
    npm run "$ANALYZE_SCRIPT" -- --url "$BASE_URL" --src-dir "$APP_SRC_DIR"; then
    echo "[run-$run_number] OK"
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo "[run-$run_number] FEHLER/TIMEOUT (fail_count=$FAIL_COUNT)" >&2
    if [[ "$CONTINUE_ON_ERROR" != "1" ]]; then
      echo "[abort] CONTINUE_ON_ERROR=$CONTINUE_ON_ERROR"
      exit 1
    fi
  fi
}

mkdir -p "$RESULTS_ROOT"

echo "[setup] Starte 12er Test-App..."
pushd "$APP_DIR" >/dev/null
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort >"../logs-12er-dev.out.txt" 2>"../logs-12er-dev.err.txt" &
DEV_PID=$!
popd >/dev/null

cleanup() {
  if ps -p "$DEV_PID" >/dev/null 2>&1; then
    echo "[cleanup] Stoppe Dev-Server (PID $DEV_PID)"
    kill "$DEV_PID" || true
  fi
}
trap cleanup EXIT

wait_for_url "$BASE_URL" 120
echo "[setup] Dev-Server ist erreichbar: $BASE_URL"
echo "[setup] Modell: $MODEL"
echo "[setup] Analyze-Script: $ANALYZE_SCRIPT"
echo "[setup] Ergebnisse: $RESULTS_ROOT"
echo "[setup] Timeout pro Run: ${RUN_TIMEOUT_SEC}s"
echo "[setup] OLLAMA_NUM_PREDICT=$OLLAMA_NUM_PREDICT"
echo "[setup] LLM_DETECT_NUM_PREDICT=$LLM_DETECT_NUM_PREDICT"
echo "[setup] LLM_DETECT_CHUNK_CHARS=$LLM_DETECT_CHUNK_CHARS"
echo "[setup] LLM_DETECT_MAX_FILES=$LLM_DETECT_MAX_FILES"

for ((run=1; run<=RUNS_PER_CONDITION; run++)); do
  echo "[progress] $run / $RUNS_PER_CONDITION"
  run_one "$run"
done

echo "[done] Kampagne abgeschlossen. Ergebnisse unter: $RESULTS_ROOT"
echo "[done] Fehlgeschlagene Runs: $FAIL_COUNT"
