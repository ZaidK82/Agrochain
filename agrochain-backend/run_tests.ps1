# run_tests.ps1
# Run all backend tests

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RUNNING AGROCHAIN BACKEND TESTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Activate virtual environment if exists
if (Test-Path "venv\Scripts\Activate.ps1") {
    & "venv\Scripts\Activate.ps1"
}

# Run pytest
pytest tests/ -v --tb=short

Write-Host "`nTests completed!" -ForegroundColor Green
