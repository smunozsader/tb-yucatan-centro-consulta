<#
  Runner script to import agreements and users CSVs and create Firebase Auth users.
  WARNING: This script will create Auth users and write documents to Firestore in the project
  specified. You confirmed earlier that this should be run.

  Usage: run from repository root in PowerShell
    pwsh .\tools\run_all_imports_and_users.ps1

  The script reads the service account path from the .env file present in the repo root
  (FIREBASE_SERVICE_ACCOUNT_KEY). It sets GOOGLE_APPLICATION_CREDENTIALS and uses the
  Node helper scripts already in the repo.
#>

Set-StrictMode -Version Latest
Write-Host "Starting import runner..." -ForegroundColor Cyan

# Resolve repository root (parent of the tools directory)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path (Join-Path $scriptDir '..') | Select-Object -ExpandProperty Path

# Load .env if present
$envFile = Join-Path $repoRoot '.env'
if (Test-Path $envFile) {
  Write-Host "Loading env from $envFile"
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^(\s*#)|(^\s*$)') { return }
    $parts = $_ -split '='; if ($parts.Length -lt 2) { return }
    $name = $parts[0].Trim(); $value = ($parts[1..($parts.Length-1)] -join '=').Trim();
    Set-Item -Path Env:\$name -Value $value
  }
}

if (-not $env:FIREBASE_SERVICE_ACCOUNT_KEY) {
  Write-Error 'FIREBASE_SERVICE_ACCOUNT_KEY not set in environment. Aborting.'; exit 1
}

Set-Item -Path Env:\GOOGLE_APPLICATION_CREDENTIALS -Value $env:FIREBASE_SERVICE_ACCOUNT_KEY
if (-not $env:FIREBASE_PROJECT_ID) { Set-Item -Path Env:\FIREBASE_PROJECT_ID -Value 'ceso-aphis-yuc' }

Write-Host "Using service account: $env:GOOGLE_APPLICATION_CREDENTIALS" -ForegroundColor Yellow
Write-Host "Project: $env:FIREBASE_PROJECT_ID" -ForegroundColor Yellow

# CSV paths (relative to repo)
$base = Join-Path $repoRoot 'BASES DATOS'
$agreementsAphis = Join-Path $base '2025_OCT_10_base_datos_APHIS_USDA.csv'
$agreementsCeso = Join-Path $base '2025_OCT_10_base_datos_CESO.csv'
$usersAphis = Join-Path $base 'usuarios_aphis-usda_new_web_app_updated.csv'
$usersCeso = Join-Path $base 'usuarios_ceso_new_web_app_updated.csv'

function Invoke-NodeCommand([string]$argumentString) {
  # Split argumentString into an array preserving quoted substrings
  $matches = [System.Text.RegularExpressions.Regex]::Matches($argumentString, '"([^"]*)"|([^\s]+)')
  $args = @()
  foreach ($m in $matches) {
    if ($m.Groups[1].Value) { $args += $m.Groups[1].Value } else { $args += $m.Groups[2].Value }
  }

  $cmd = "node " + ($args -join ' ')
  Write-Host ">= $cmd"
  # Invoke node with an argument array to preserve quoting and spaces
  $output = & node @args 2>&1
  $exit = $LASTEXITCODE
  if ($exit -ne 0) {
    Write-Host $output
    throw "Node exited with code $exit"
  }
  Write-Host $output
}

try {
  # DRY RUNS
  Write-Host "Dry-run parsing CSVs..." -ForegroundColor Cyan
  Invoke-NodeCommand "tools/import_csv_to_firestore.js --file `"$agreementsCeso`" --collection acuerdos-ceso --dry-run"
  Invoke-NodeCommand "tools/import_csv_to_firestore.js --file `"$agreementsAphis`" --collection acuerdos-aphis --dry-run"
  Invoke-NodeCommand "tools/import_csv_to_firestore.js --file `"$usersCeso`" --collection users --dry-run"
  Invoke-NodeCommand "tools/import_csv_to_firestore.js --file `"$usersAphis`" --collection users --dry-run"

  # IMPORT AGREEMENTS
  Write-Host "Importing agreements (acuerdos-ceso, acuerdos-aphis)..." -ForegroundColor Cyan
  Invoke-NodeCommand "tools/import_csv_to_firestore.js --file `"$agreementsCeso`" --collection acuerdos-ceso --project $env:FIREBASE_PROJECT_ID --batch-size 400"
  Invoke-NodeCommand "tools/import_csv_to_firestore.js --file `"$agreementsAphis`" --collection acuerdos-aphis --project $env:FIREBASE_PROJECT_ID --batch-size 400"

  # CREATE AUTH USERS: process both users files
  Write-Host "Creating Firebase Auth users from CSVs..." -ForegroundColor Cyan
  function Process-UsersCsv($csvPath) {
    Write-Host "Processing users CSV: $csvPath"
    $rows = Import-Csv -Path $csvPath
    foreach ($r in $rows) {
      $email = $r.correo.Trim()
      $password = $r.contrasena.Trim()
      $roleRaw = $r.rol.Trim()
      # map spanish 'Administrador' to ADMINISTRATOR, else RESPONSABLE
      if ($roleRaw -match 'Admini' -or $roleRaw -match 'Admin') { $role = 'ADMINISTRATOR' } else { $role = 'RESPONSABLE' }
      Write-Host "Creating/ensuring user: $email (role $role)"
      Invoke-NodeCommand "scripts/ensure-firebase-user.js `"$email`" `"$password`" $role"
      Start-Sleep -Seconds 1
    }
  }

  Process-UsersCsv $usersAphis
  Process-UsersCsv $usersCeso

  # IMPORT USERS DOCUMENTS
  Write-Host "Importing user documents into Firestore 'users' collection..." -ForegroundColor Cyan
  Invoke-NodeCommand "tools/import_csv_to_firestore.js --file `"$usersAphis`" --collection users --project $env:FIREBASE_PROJECT_ID --batch-size 400"
  Invoke-NodeCommand "tools/import_csv_to_firestore.js --file `"$usersCeso`" --collection users --project $env:FIREBASE_PROJECT_ID --batch-size 400"

  Write-Host "All done. Auth users created and CSVs imported." -ForegroundColor Green
  Write-Host "Reminder: ask your users to sign out/sign in or run client token refresh to pick up custom claims." -ForegroundColor Yellow

} catch {
  Write-Error "Script failed: $_"
  exit 1
}
