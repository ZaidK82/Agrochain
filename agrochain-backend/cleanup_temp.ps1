# cleanup_temp.ps1
# Run this to safely delete all temp files

Write-Host "Cleaning temp folder..." -ForegroundColor Yellow

$tempPath = "temp"

if (Test-Path $tempPath) {
    # Delete all files except .gitignore and README.md
    Get-ChildItem -Path $tempPath -Recurse -File | 
        Where-Object { $_.Name -notin @(".gitignore", "README.md") } |
        Remove-Item -Force
    
    # Delete empty directories
    Get-ChildItem -Path $tempPath -Directory | 
        Where-Object { (Get-ChildItem $_.FullName -Force).Count -eq 0 } |
        Remove-Item -Force
    
    Write-Host "✓ Temp folder cleaned" -ForegroundColor Green
} else {
    Write-Host "Temp folder not found" -ForegroundColor Red
}

# Also clean Python cache
Get-ChildItem -Path . -Include "__pycache__" -Recurse -Directory | Remove-Item -Force -Recurse
Get-ChildItem -Path . -Include "*.pyc" -Recurse -File | Remove-Item -Force

Write-Host "✓ Python cache cleaned" -ForegroundColor Green
