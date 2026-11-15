$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = '--force-renderer-accessibility'
$binary = Join-Path $PSScriptRoot '../src-tauri/target/release/tempora.exe'
$process = Start-Process -FilePath (Resolve-Path -LiteralPath $binary) -PassThru -WindowStyle Hidden
try {
    $deadline = (Get-Date).AddSeconds(45)
    $window = $null
    $controls = @()
    while ((Get-Date) -lt $deadline) {
        Start-Sleep -Milliseconds 500
        $process.Refresh()
        if ($process.HasExited) { throw "Tempora exited during startup: $($process.ExitCode)" }
        if ($process.MainWindowHandle -ne [IntPtr]::Zero) {
            $window = [System.Windows.Automation.AutomationElement]::FromHandle($process.MainWindowHandle)
            $all = $window.FindAll([System.Windows.Automation.TreeScope]::Descendants, [System.Windows.Automation.Condition]::TrueCondition)
            $controls = @($all | Where-Object { $_.Current.ControlType -eq [System.Windows.Automation.ControlType]::Button -and $_.Current.Name })
            if ($controls.Count -ge 2) { break }
        }
    }
    if (-not $window) { throw 'The native Tempora window was not found.' }
    if ($controls.Count -lt 2) { throw 'The native accessibility tree did not expose named buttons.' }
    $names = @($controls | ForEach-Object { $_.Current.Name })
    if (-not ($names | Where-Object { $_ -match 'Continuar|Continue|Añadir|Add' })) { throw 'Expected Tempora controls were not exposed by WebView2.' }
    @{ application = 'Tempora'; nativeWindow = $true; running = -not $process.HasExited; namedButtons = $controls.Count; names = $names; scope = 'Automated Windows startup and UI Automation tree; not a physical screen-reader test.' } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $PSScriptRoot '../desktop-smoke.json') -Encoding utf8
} finally {
    if (-not $process.HasExited) { Stop-Process -Id $process.Id }
}
