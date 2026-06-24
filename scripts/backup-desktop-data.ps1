# Backs up New-Era desktop user data (%APPDATA%\New-Era) into ./backups/desktop/<timestamp>/
param(
  [string]$Label = "manual"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$sourceRoot = Join-Path $env:APPDATA "New-Era"
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$destRoot = Join-Path $repoRoot "backups\desktop\$timestamp-$Label"

if (-not (Test-Path $sourceRoot)) {
  Write-Error "Desktop data folder not found: $sourceRoot"
}

New-Item -ItemType Directory -Path $destRoot -Force | Out-Null

$items = @(
  @{ Path = "data\app.db"; Required = $true },
  @{ Path = "config.json"; Required = $false },
  @{ Path = "cache"; Required = $false }
)

foreach ($item in $items) {
  $src = Join-Path $sourceRoot $item.Path
  if (-not (Test-Path $src)) {
    if ($item.Required) {
      Write-Error "Required file missing: $src"
    }
    continue
  }
  $dest = Join-Path $destRoot $item.Path
  $destParent = Split-Path -Parent $dest
  if (-not (Test-Path $destParent)) {
    New-Item -ItemType Directory -Path $destParent -Force | Out-Null
  }
  if ((Get-Item $src).PSIsContainer) {
    Copy-Item -LiteralPath $src -Destination $dest -Recurse -Force
  } else {
    Copy-Item -LiteralPath $src -Destination $dest -Force
  }
  Write-Host "Copied $src -> $dest"
}

Write-Host "Backup complete: $destRoot"
