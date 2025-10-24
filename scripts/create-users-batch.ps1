# Create Firebase Auth users and set custom claims using scripts/ensure-firebase-user.js
# Usage:
#   $env:FIREBASE_SERVICE_ACCOUNT_KEY='C:\path\to\serviceAccountKey.json'
#   .\scripts\create-users-batch.ps1 -CsvPath .\scripts\users-to-create.csv

param(
  [string]$CsvPath = "$PSScriptRoot\users-to-create.csv",
  [switch]$DryRun
)

if(-not (Test-Path $CsvPath)){
  Write-Error "CSV file not found: $CsvPath"
  exit 1
}

$rows = Import-Csv -Path $CsvPath

foreach($r in $rows){
  $email = $r.email.Trim()
  $password = $r.password.Trim()
  $role = $r.role.Trim()
  Write-Host "Processing: $email -> role: $role"
  if($DryRun){ continue }

  $cmd = "node .\scripts\ensure-firebase-user.js `"$email`" `"$password`" `"$role`""
  Write-Host "Running: $cmd"
  $proc = Start-Process -FilePath node -ArgumentList ".\scripts\ensure-firebase-user.js","$email","$password","$role" -NoNewWindow -Wait -PassThru
  if($proc.ExitCode -ne 0){
    Write-Warning "Command failed for $email (exit $($proc.ExitCode))"
  } else {
    Write-Host "Created/updated $email"
  }
}

Write-Host "Done. If you changed claims, remember to ask users to sign in and refresh token (getIdToken(true))."