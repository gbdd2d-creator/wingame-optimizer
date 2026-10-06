Add-Type -AssemblyName System.Drawing

$size = 256
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Background gradient
$rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(255, 139, 92, 246),   # #8b5cf6
    [System.Drawing.Color]::FromArgb(255, 217, 70, 239),   # #d946ef
    [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
)
$g.FillRectangle($brush, $rect)

# Rounded corners mask (clip)
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$radius = 48
$d = $radius * 2
$path.AddArc(0, 0, $d, $d, 180, 90)
$path.AddArc($size - $d, 0, $d, $d, 270, 90)
$path.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
$path.AddArc(0, $size - $d, $d, $d, 90, 90)
$path.CloseFigure()
$g.SetClip($path)

# Inner subtle glow
$inner = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(120, 255, 255, 255),
    [System.Drawing.Color]::FromArgb(0, 255, 255, 255),
    [System.Drawing.Drawing2D.LinearGradientMode]::BackwardDiagonal
)
$g.FillRectangle($inner, $rect)

# Lightning bolt (polygon) centered
$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$bolt = @(
    (New-Object System.Drawing.PointF(128, 30)),
    (New-Object System.Drawing.PointF(60, 140)),
    (New-Object System.Drawing.PointF(108, 140)),
    (New-Object System.Drawing.PointF(82, 226)),
    (New-Object System.Drawing.PointF(196, 108)),
    (New-Object System.Drawing.PointF(142, 108)),
    (New-Object System.Drawing.PointF(182, 30))
)
$g.FillPolygon($white, $bolt)

$g.Flush()

# Save PNG bytes
$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$pngBytes = $ms.ToArray()
$ms.Dispose()

# Wrap PNG in ICO container (single 256x256 entry)
$out = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($out)
$bw.Write([UInt16]0)      # reserved
$bw.Write([UInt16]1)      # type: icon
$bw.Write([UInt16]1)      # count
$bw.Write([Byte]0)        # width (0 = 256)
$bw.Write([Byte]0)        # height (0 = 256)
$bw.Write([Byte]0)        # color count
$bw.Write([Byte]0)        # reserved
$bw.Write([UInt16]1)      # planes
$bw.Write([UInt16]32)     # bit count
$bw.Write([UInt32]$pngBytes.Length)  # bytes in resource
$bw.Write([UInt32]22)     # image offset (6 + 16)
$bw.Write($pngBytes)
$bw.Flush()

$iconBytes = $out.ToArray()
$bw.Dispose()
$out.Dispose()

$buildDir = Join-Path $PSScriptRoot 'build'
if (-not (Test-Path $buildDir)) { New-Item -ItemType Directory -Path $buildDir | Out-Null }
$icoPath = Join-Path $buildDir 'icon.ico'
[System.IO.File]::WriteAllBytes($icoPath, $iconBytes)

$pngPath = Join-Path $buildDir 'icon.png'
[System.IO.File]::WriteAllBytes($pngPath, $pngBytes)

$g.Dispose()
$bmp.Dispose()

Write-Output "Icon created: $icoPath ($($iconBytes.Length) bytes)"