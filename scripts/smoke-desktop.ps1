$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = '--force-renderer-accessibility --remote-debugging-port=9223'
$binary = Join-Path $PSScriptRoot '../src-tauri/target/release/tempora.exe'
$process = Start-Process -FilePath (Resolve-Path -LiteralPath $binary) -PassThru -WindowStyle Hidden
try {
    $deadline = (Get-Date).AddSeconds(45)
    $window = $null
    while ((Get-Date) -lt $deadline) {
        Start-Sleep -Milliseconds 500
        $process.Refresh()
        if ($process.HasExited) { throw "Tempora exited during startup: $($process.ExitCode)" }
        if ($process.MainWindowHandle -ne [IntPtr]::Zero) {
            $window = [System.Windows.Automation.AutomationElement]::FromHandle($process.MainWindowHandle)
            try {
                $targets = Invoke-RestMethod -Uri 'http://127.0.0.1:9223/json' -TimeoutSec 2
                if ($targets | Where-Object { $_.type -eq 'page' -and $_.url -match 'app/index.html' }) { break }
            } catch { }
        }
    }
    if (-not $window) { throw 'The native Tempora window was not found.' }
    & node (Join-Path $PSScriptRoot 'verify-tauri.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'The native WebView2 verification failed.' }
} finally {
    if (-not $process.HasExited) { Stop-Process -Id $process.Id }
}
