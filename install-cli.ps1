# Installiert den globalen Terminal-Befehl `ncos` (cmd-Shim auf ncos.js).
$ErrorActionPreference = "Stop"

$repoRoot = $PSScriptRoot
$binDir = if ($env:NCOS_BIN_DIR) { $env:NCOS_BIN_DIR } else { Join-Path $env:USERPROFILE ".nc-os\bin" }

New-Item -ItemType Directory -Force -Path $binDir | Out-Null

$shimPath = Join-Path $binDir "ncos.cmd"
$shim = "@echo off`r`nnode `"$repoRoot\ncos.js`" %*"
Set-Content -Path $shimPath -Value $shim -Encoding Ascii

Write-Host "ncos installiert: $shimPath -> $repoRoot\ncos.js"

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$binDir*") {
    Write-Host "HINWEIS: $binDir ist nicht im PATH. Hinzufuegen mit:"
    Write-Host "  [Environment]::SetEnvironmentVariable('Path', `"$binDir;`" + [Environment]::GetEnvironmentVariable('Path','User'), 'User')"
}
