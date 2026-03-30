#!/usr/bin/env bash
set -euo pipefail

RUNS_PER_CONDITION="${RUNS_PER_CONDITION:-10}"
MODEL="${MODEL:-qwen2.5-coder:7b}"
APP_DIR="${APP_DIR:-test}"
APP_SRC_DIR="${APP_SRC_DIR:-test/src}"
BASE_URL="${BASE_URL:-http://127.0.0.1:4173}"
OUT_ROOT="${OUT_ROOT:-results-campaign/12er-first40}"
MODEL_DIR="$(echo "$MODEL" | tr '/: ' '___')"
RESULTS_ROOT="$OUT_ROOT/$MODEL_DIR"

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
  local condition="$1"
  local run_number="$2"
  local script_name="$3"

  local run_dir
  run_dir="$RESULTS_ROOT/$condition/run-$(printf '%02d' "$run_number")"
  mkdir -p "$run_dir"

  echo "[$condition][$run_number] npm run $script_name -- --url $BASE_URL --src-dir $APP_SRC_DIR"

  RESULTS_DIR="$run_dir" TARGET_URL="$BASE_URL" OLLAMA_MODEL="$MODEL" \
    npm run "$script_name" -- --url "$BASE_URL" --src-dir "$APP_SRC_DIR"
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

conditions=(
  "01-axe-only:axe"
  "02-tools-only:prompt"
  "03-tools-llm-prio:analyze"
  "04-tools-llm-detector-prio:analyze:llm-detector"
)

total=$(( RUNS_PER_CONDITION * ${#conditions[@]} ))
counter=0

for item in "${conditions[@]}"; do
  condition="${item%%:*}"
  script_name="${item#*:}"

  for ((run=1; run<=RUNS_PER_CONDITION; run++)); do
    counter=$((counter + 1))
    echo "[progress] $counter / $total"
    run_one "$condition" "$run" "$script_name"
  done
done

echo "[done] Kampagne abgeschlossen. Ergebnisse unter: $RESULTS_ROOT"
