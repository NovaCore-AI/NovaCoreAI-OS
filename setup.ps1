# Dünner Wrapper: ruft die zentrale Setup-Logik (Node) auf.
$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot
node setup.js @args
exit $LASTEXITCODE
