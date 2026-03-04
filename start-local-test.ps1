$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$Port = 8000
$HostAddress = "localhost"
$PidFile = Join-Path $ProjectRoot ".local-test-server.pid"
$StdoutLogFile = Join-Path $ProjectRoot ".local-test-server.out.log"
$StderrLogFile = Join-Path $ProjectRoot ".local-test-server.err.log"

function Stop-ByPidFile {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        return
    }

    $existingPid = Get-Content $Path -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($existingPid -and ($existingPid -as [int])) {
        Stop-Process -Id ([int]$existingPid) -Force -ErrorAction SilentlyContinue
    }

    Remove-Item $Path -Force -ErrorAction SilentlyContinue
}

function Stop-ByPort {
    param([int]$TargetPort, [string]$TargetHost)

    $listeners = Get-NetTCPConnection -State Listen -LocalPort $TargetPort -ErrorAction SilentlyContinue |
        Where-Object { $_.LocalAddress -eq $TargetHost }

    if ($listeners) {
        $listeners |
            Select-Object -ExpandProperty OwningProcess -Unique |
            ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    }
}

Stop-ByPidFile -Path $PidFile
Stop-ByPort -TargetPort $Port -TargetHost $HostAddress

$args = @("-m", "http.server", "$Port", "--bind", $HostAddress)
$proc = Start-Process -FilePath "python" -ArgumentList $args -WorkingDirectory $ProjectRoot -PassThru `
    -RedirectStandardOutput $StdoutLogFile -RedirectStandardError $StderrLogFile

$proc.Id | Out-File -FilePath $PidFile -Encoding ascii -NoNewline

Write-Output "Local test server started."
Write-Output "URL: http://$HostAddress`:$Port/"
Write-Output "PID: $($proc.Id)"
Write-Output "Stdout log: $StdoutLogFile"
Write-Output "Stderr log: $StderrLogFile"
