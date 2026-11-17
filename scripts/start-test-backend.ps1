param(
  [switch]$ReuseTunnel,
  [switch]$BuildApk
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Path $PSScriptRoot -Parent
$easPath = Join-Path -Path $projectRoot -ChildPath 'eas.json'
$cloudflared = 'C:\Program Files (x86)\cloudflared\cloudflared.exe'
$logDir = Join-Path -Path $env:TEMP -ChildPath 'quixada-tunnel'
$tunnelOutLog = Join-Path -Path $logDir -ChildPath 'cloudflared.out.log'
$tunnelErrLog = Join-Path -Path $logDir -ChildPath 'cloudflared.err.log'

function Wait-ForHealth {
  param(
    [string]$Url,
    [int]$TimeoutSeconds
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-RestMethod -Uri $Url -TimeoutSec 5
      if ($response.status -eq 'ok') {
        return $true
      }
    } catch {
      Start-Sleep -Seconds 2
    }
  }
  return $false
}

if (-not (Test-Path -LiteralPath $easPath)) {
  throw "eas.json not found at $easPath"
}

if (-not (Test-Path -LiteralPath $cloudflared)) {
  throw "cloudflared not found at $cloudflared"
}

if (-not (Test-Path -LiteralPath $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}

Push-Location -LiteralPath $projectRoot
try {
  Write-Host 'Starting Docker (api/db)...' -ForegroundColor Cyan
  docker compose up -d
  if ($LASTEXITCODE -ne 0) {
    throw 'Docker Compose failed.'
  }

  if (-not (Wait-ForHealth -Url 'http://localhost:4000/api/health' -TimeoutSeconds 60)) {
    throw 'Local API did not respond at http://localhost:4000/api/health'
  }
  Write-Host 'Local API OK.' -ForegroundColor Green
} finally {
  Pop-Location
}

$running = Get-Process -Name 'cloudflared' -ErrorAction SilentlyContinue
if ($running -and -not $ReuseTunnel) {
  $running | Stop-Process -Force
  Start-Sleep -Seconds 2
  $running = $null
}

if (-not $running) {
  Write-Host 'Creating Cloudflare tunnel...' -ForegroundColor Cyan
  $process = Start-Process -FilePath $cloudflared `
    -ArgumentList @('tunnel', '--url', 'http://localhost:4000') `
    -RedirectStandardOutput $tunnelOutLog `
    -RedirectStandardError $tunnelErrLog `
    -WindowStyle Hidden `
    -PassThru
  Write-Host "Tunnel started (PID $($process.Id))." -ForegroundColor Green
}

$tunnelUrl = $null
$deadline = (Get-Date).AddSeconds(90)
while ((Get-Date) -lt $deadline -and -not $tunnelUrl) {
  $output = Get-Content -LiteralPath $tunnelOutLog -Raw -ErrorAction SilentlyContinue
  $errors = Get-Content -LiteralPath $tunnelErrLog -Raw -ErrorAction SilentlyContinue
  $match = [regex]::Match(
    "$output`n$errors",
    'https://[a-z0-9-]+\.trycloudflare\.com',
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
  )
  if ($match.Success) {
    $tunnelUrl = $match.Value
    break
  }
  Start-Sleep -Seconds 2
}

if (-not $tunnelUrl) {
  throw "Could not find tunnel URL. Check logs in $logDir"
}

$publicApiUrl = "$tunnelUrl/api"
if (-not (Wait-ForHealth -Url "$publicApiUrl/health" -TimeoutSeconds 90)) {
  throw "Tunnel created but $publicApiUrl/health did not respond."
}

$config = Get-Content -LiteralPath $easPath -Raw | ConvertFrom-Json
if (-not $config.build -or -not $config.build.preview) {
  throw 'eas.json has no build.preview profile.'
}
if (-not $config.build.preview.env) {
  $config.build.preview | Add-Member -NotePropertyName 'env' -NotePropertyValue @{}
}
if (-not $config.build.production) {
  $config.build | Add-Member -NotePropertyName 'production' -NotePropertyValue @{}
}
if (-not $config.build.production.env) {
  $config.build.production | Add-Member -NotePropertyName 'env' -NotePropertyValue @{}
}
$config.build.preview.env.EXPO_PUBLIC_API_URL = $publicApiUrl
$config.build.production.env.EXPO_PUBLIC_API_URL = $publicApiUrl
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText(
  $easPath,
  ($config | ConvertTo-Json -Depth 20),
  $utf8NoBom
)

Write-Host "Public API: $publicApiUrl" -ForegroundColor Green
Write-Host 'eas.json updated.' -ForegroundColor Green

if ($BuildApk) {
  Write-Host 'Building APK...' -ForegroundColor Cyan
  Push-Location -LiteralPath $projectRoot
  try {
    npm run build:apk
    if ($LASTEXITCODE -ne 0) {
      throw 'APK build failed.'
    }
  } finally {
    Pop-Location
  }
  Write-Host 'APK sent to EAS. Use the link/QR printed above.' -ForegroundColor Green
}
