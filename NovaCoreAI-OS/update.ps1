# Dünner Wrapper: ruft die zentrale Update-Logik (Node) auf.
$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot
node update.js @args
exit $LASTEXITCODE
