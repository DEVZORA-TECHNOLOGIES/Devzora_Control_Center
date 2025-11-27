$scriptPath = $PSScriptRoot
$envPath = Join-Path $scriptPath "frontend\.env"

Write-Host "Fixing frontend .env file at: $envPath" -ForegroundColor Cyan

$content = @(
    "# API URL - Leave empty for local development to use Vite proxy",
    "# VITE_API_URL=",
    "",
    "# For production deployment, uncomment and set this to your backend URL:",
    "# VITE_API_URL=https://devzora-control-center.onrender.com"
)

if (Test-Path $envPath) {
    Copy-Item $envPath "$envPath.backup" -Force
    Write-Host "Backed up existing .env" -ForegroundColor Green
}

Set-Content -Path $envPath -Value $content -Encoding UTF8
Write-Host "Updated .env file successfully." -ForegroundColor Green
Write-Host "Please restart your dev server (npm run dev) for changes to take effect." -ForegroundColor Yellow
