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
            if ($window.Current.Name -match 'Tempora') { break }
        }
    }
    if (-not $window) { throw 'The native Tempora window was not found.' }
    if ($window.Current.Name -notmatch 'Tempora') { throw 'The native window did not have the expected Tempora title.' }
    if ($process.WaitForExit(5000)) { throw "Tempora exited after opening its window: $($process.ExitCode)" }
    @{ application = 'Tempora'; nativeWindow = $true; windowTitle = $window.Current.Name; runningAfterStartup = $true; scope = 'Production Windows binary: process and native window startup. The browser workflow separately tests the rendered interface, keyboard and Chromium accessibility tree. This does not certify a physical screen reader or native UI interactions.' } | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $PSScriptRoot '../desktop-smoke.json') -Encoding utf8
} finally {
    if (-not $process.HasExited) { Stop-Process -Id $process.Id }
}
