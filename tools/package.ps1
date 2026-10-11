# Builds dist/<name>-<version>.zip containing only what the extension needs (manifest at the zip root).
# Entries are written with forward slashes (Compress-Archive in Windows PowerShell 5.1 uses backslashes).
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$manifest = Get-Content (Join-Path $root 'manifest.json') -Raw | ConvertFrom-Json
$dist = Join-Path $root 'dist'
New-Item -ItemType Directory -Force $dist | Out-Null
$zipPath = Join-Path $dist "spotify-audio-plus-$($manifest.version).zip"
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue

$files = @(Get-Item (Join-Path $root 'manifest.json'))
foreach ($dir in 'src', 'icons') {
  $files += Get-ChildItem (Join-Path $root $dir) -Recurse -File
}

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')
try {
  foreach ($f in $files) {
    $entry = $f.FullName.Substring($root.Length + 1).Replace('\', '/')
    [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $f.FullName, $entry, 'Optimal')
  }
} finally {
  $zip.Dispose()
}
Write-Host "Created $zipPath"
