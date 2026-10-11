# Generates icons/icon-{16,48,128}.png. Original artwork (an A-B loop segment on a progress bar), no Spotify branding.
Add-Type -AssemblyName System.Drawing
$out = Join-Path $PSScriptRoot '..\icons'
New-Item -ItemType Directory -Force $out | Out-Null

function New-Icon([int]$size) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.TextRenderingHint = 'AntiAliasGridFit'
  $g.Clear([System.Drawing.Color]::Transparent)

  # rounded dark background
  $r = $size * 0.22
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc(0, 0, 2 * $r, 2 * $r, 180, 90)
  $path.AddArc($size - 2 * $r, 0, 2 * $r, 2 * $r, 270, 90)
  $path.AddArc($size - 2 * $r, $size - 2 * $r, 2 * $r, 2 * $r, 0, 90)
  $path.AddArc(0, $size - 2 * $r, 2 * $r, 2 * $r, 90, 90)
  $path.CloseFigure()
  $g.FillPath((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 24, 32, 28))), $path)

  $light = [System.Drawing.Color]::FromArgb(255, 79, 245, 138)
  $dark = [System.Drawing.Color]::FromArgb(255, 11, 107, 48)
  $grey = [System.Drawing.Color]::FromArgb(255, 110, 118, 114)

  # progress bar: grey track, loop segment (light then dark green), end ticks
  $barY = $size * 0.70
  $h = [Math]::Max(2, $size * 0.11)
  $x0 = $size * 0.10; $x1 = $size * 0.90
  $a = $size * 0.28;  $b = $size * 0.72; $mid = $size * 0.50
  $g.FillRectangle((New-Object System.Drawing.SolidBrush $grey), $x0, $barY, $x1 - $x0, $h)
  $g.FillRectangle((New-Object System.Drawing.SolidBrush $light), $a, $barY, $mid - $a, $h)
  $g.FillRectangle((New-Object System.Drawing.SolidBrush $dark), $mid, $barY, $b - $mid, $h)
  $tw = [Math]::Max(1.5, $size * 0.06)
  $g.FillRectangle((New-Object System.Drawing.SolidBrush $light), $a - $tw / 2, $barY - $h * 0.7, $tw, $h * 2.4)
  $g.FillRectangle((New-Object System.Drawing.SolidBrush $light), $b - $tw / 2, $barY - $h * 0.7, $tw, $h * 2.4)

  # "AB" lettering
  $font = New-Object System.Drawing.Font 'Segoe UI', ($size * 0.36), ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = 'Center'; $sf.LineAlignment = 'Center'
  $g.DrawString('AB', $font, (New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)), (New-Object System.Drawing.RectangleF 0, ($size * 0.06), $size, ($size * 0.55)), $sf)

  $g.Dispose()
  $bmp.Save((Join-Path $out "icon-$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

foreach ($s in 16, 48, 128) { New-Icon $s }
Write-Host "Icons written to $out"
