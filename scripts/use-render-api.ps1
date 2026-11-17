param(
  [Parameter(Mandatory = $true)]
  [string]$ApiUrl,
  [switch]$BuildApk
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Path $PSScriptRoot -Parent
$easPath = Join-Path -Path $projectRoot -ChildPath 'eas.json'
$baseUrl = $ApiUrl.Trim().TrimEnd('/')

if ($baseUrl -notmatch '^https://') {
  throw 'ApiUrl must start with https://'
}

$publicApiUrl = if ($baseUrl -match '/api$') { $baseUrl } else { "$baseUrl/api" }

function Wait-ForHealth {
  param(
    [string]$Url,
    [int]$TimeoutSeconds
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-RestMethod -Uri $Url -TimeoutSec 10
      if ($response.status -eq 'ok') {
        return $true
      }
    } catch {
      Start-Sleep -Seconds 5
    }
  }
  return $false
}

if (-not (Test-Path -LiteralPath $easPath)) {
  throw "eas.json not found at $easPath"
}

Write-Host "Checking $publicApiUrl/health ..." -ForegroundColor Cyan
if (-not (Wait-ForHealth -Url "$publicApiUrl/health" -TimeoutSeconds 180)) {
  throw "Render API did not respond at $publicApiUrl/health"
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
    npm run build:apk -- --no-wait
    if ($LASTEXITCODE -ne 0) {
      throw 'APK build failed.'
    }
  } finally {
    Pop-Location
  }
  Write-Host 'APK sent to EAS. Download the artifact when the build finishes.' -ForegroundColor Green
}
