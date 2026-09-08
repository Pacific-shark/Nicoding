$ErrorActionPreference = 'Stop'
$nicodingPidFile = Join-Path $PSScriptRoot 'work\server.pid'
if (-not (Test-Path -LiteralPath $nicodingPidFile)) { Write-Output 'No Nicoding server PID was recorded.'; exit }
$nicodingServerPid = [int](Get-Content -LiteralPath $nicodingPidFile)
$nicodingServerPath = Join-Path $PSScriptRoot 'server.mjs'
$nicodingProcess = Get-CimInstance Win32_Process -Filter ('ProcessId = ' + $nicodingServerPid)
if ($nicodingProcess -and $nicodingProcess.Name -eq 'node.exe' -and $nicodingProcess.CommandLine.Contains($nicodingServerPath)) {
    Stop-Process -Id $nicodingServerPid
    Write-Output 'Nicoding server stopped. Your browser learning records are unchanged.'
} else { Write-Output 'The recorded process is no longer this Nicoding server; nothing was stopped.' }
