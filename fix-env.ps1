# Fix Frontend .env for Local Development

Write-Host "Fixing frontend .env file for local development..." -ForegroundColor Cyan

$envPath = "frontend\.env"
$envContent = @"
# API URL - Leave empty for local development to use Vite proxy
# VITE_API_URL=

# For production deployment, uncomment and set this to your backend URL:
# VITE_API_URL=https://devzora-control-center.onrender.com
"@

# Backup existing .env if it exists
if (Test-Path $envPath) {
    $backupPath = "frontend\.env.backup"
    Copy-Item $envPath $backupPath -Force
    Write-Host "✓ Backed up existing .env to .env.backup" -ForegroundColor Green
}

# Write new .env content
$envContent | Out-File -FilePath $envPath -Encoding utf8 -Force
Write-Host "✓ Updated frontend\.env file" -ForegroundColor Green

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Stop the dev server (Ctrl+C)" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Refresh your browser at http://localhost:8080" -ForegroundColor White
Write-Host "`nThe Budgets page should now work correctly!" -ForegroundColor Green
