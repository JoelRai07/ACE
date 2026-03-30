param(
  [int]$RunsPerCondition = 10,
  [string]$Model = "qwen2.5-coder:7b",
  [string]$AppDir = "test",
  [string]$AppSrcDir = "test/src",
  [string]$BaseUrl = "http://127.0.0.1:4173",
  [string]$OutRoot = "results-campaign/12er-first40"
)

$ErrorActionPreference = "Stop"

function Invoke-AnalysisRun {
  param(
    [string]$Condition,
    [int]$RunNumber,
    [string]$ScriptName,
    [string[]]$ExtraArgs
  )

  $runDir = Join-Path $OutRoot (Join-Path $Condition ("run-" + $RunNumber.ToString("00")))
  New-Item -ItemType Directory -Force -Path $runDir | Out-Null

  $env:RESULTS_DIR = $runDir
  $env:TARGET_URL = $BaseUrl
  $env:OLLAMA_MODEL = $Model

  $cmdArgs = @("run", $ScriptName, "--", "--url", $BaseUrl, "--src-dir", $AppSrcDir) + $ExtraArgs

  Write-Host "[$Condition][$RunNumber] npm $($cmdArgs -join ' ')" -ForegroundColor Cyan
  & npm @cmdArgs

  if ($LASTEXITCODE -ne 0) {
    throw "Run fehlgeschlagen: Condition=$Condition Run=$RunNumber ExitCode=$LASTEXITCODE"
  }
}

function Wait-ForUrl {
  param(
    [string]$Url,
    [int]$TimeoutSec = 90
  )

  $start = Get-Date
  while (((Get-Date) - $start).TotalSeconds -lt $TimeoutSec) {
    try {
      $null = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
      return
    } catch {
      Start-Sleep -Milliseconds 1000
    }
  }

  throw "Dev-Server unter $Url wurde nicht rechtzeitig erreichbar."
}

$originalLocation = Get-Location
$devProcess = $null

try {
  New-Item -ItemType Directory -Force -Path $OutRoot | Out-Null

  Write-Host "[setup] Starte 12er Test-App..." -ForegroundColor Yellow
  Push-Location $AppDir
  $devLogOut = Join-Path $originalLocation.Path "logs-12er-dev.out.txt"
  $devLogErr = Join-Path $originalLocation.Path "logs-12er-dev.err.txt"

  $devProcess = Start-Process -FilePath "npm.cmd" `
    -ArgumentList @("run", "dev", "--", "--host", "127.0.0.1", "--port", "4173", "--strictPort") `
    -RedirectStandardOutput $devLogOut `
    -RedirectStandardError $devLogErr `
    -PassThru

  Pop-Location

  Wait-ForUrl -Url $BaseUrl -TimeoutSec 120
  Write-Host "[setup] Dev-Server ist erreichbar: $BaseUrl" -ForegroundColor Green

  $conditions = @(
    @{ Name = "01-axe-only"; Script = "axe"; Extra = @() },
    @{ Name = "02-tools-only"; Script = "prompt"; Extra = @() },
    @{ Name = "03-tools-llm-prio"; Script = "analyze"; Extra = @() },
    @{ Name = "04-tools-llm-detector-prio"; Script = "analyze:llm-detector"; Extra = @() }
  )

  $total = $RunsPerCondition * $conditions.Count
  $counter = 0

  foreach ($cond in $conditions) {
    for ($run = 1; $run -le $RunsPerCondition; $run++) {
      $counter++
      Write-Host "[progress] $counter / $total" -ForegroundColor Magenta
      Invoke-AnalysisRun -Condition $cond.Name -RunNumber $run -ScriptName $cond.Script -ExtraArgs $cond.Extra
    }
  }

  Write-Host "[done] Kampagne abgeschlossen. Ergebnisse unter: $OutRoot" -ForegroundColor Green
}
finally {
  if ($devProcess -and -not $devProcess.HasExited) {
    Write-Host "[cleanup] Stoppe Dev-Server (PID $($devProcess.Id))" -ForegroundColor Yellow
    Stop-Process -Id $devProcess.Id -Force
  }

  Set-Location $originalLocation
}
