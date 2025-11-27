<#
.SYNOPSIS
    Automates uploading the project to GitHub.
.DESCRIPTION
    This script initializes a git repo, configures the user, adds files, commits, and pushes to GitHub.
#>

$ErrorActionPreference = "Stop"

$GitUser = "GodricTM"
$GitEmail = "godric1998@gmail.com"

Write-Host "Setting up Git for $GitUser ($GitEmail)..." -ForegroundColor Cyan
git config --global user.name $GitUser
git config --global user.email $GitEmail

# Ensure .gitignore exists to prevent uploading node_modules
if (-not (Test-Path ".gitignore")) {
    Write-Host "Creating .gitignore..." -ForegroundColor Yellow
    $IgnoreContent = @"
node_modules
dist
build
.env
.DS_Store
.vscode
"@
    Set-Content -Path ".gitignore" -Value $IgnoreContent
}

if (-not (Test-Path ".git")) {
    Write-Host "Initializing new Git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
}

Write-Host "Adding all files to staging..." -ForegroundColor Cyan
git add .

$CommitMsg = Read-Host "Enter commit message (Press Enter for default timestamp)"
if ([string]::IsNullOrWhiteSpace($CommitMsg)) {
    $CommitMsg = "Auto-save: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

Write-Host "Committing: $CommitMsg" -ForegroundColor Cyan
try {
    git commit -m "$CommitMsg"
} catch {
    Write-Warning "Nothing to commit or commit failed (maybe nothing changed?)."
}

$CurrentRemote = git remote get-url origin 2>$null
if (-not $CurrentRemote) {
    Write-Host "Configuring remote repository..." -ForegroundColor Yellow
    $RepoUrl = "https://github.com/GodricTM/helix-website.git"
    git remote add origin $RepoUrl
    Write-Host "Remote 'origin' set to $RepoUrl" -ForegroundColor Green
}

Write-Host "Pushing to GitHub (FORCE OVERWRITE)..." -ForegroundColor Cyan
git push -u origin main --force

Write-Host "Upload complete! Remote repository now matches local folder." -ForegroundColor Green
Read-Host "Press Enter to exit..."
