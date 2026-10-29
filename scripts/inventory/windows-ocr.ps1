param(
  [string]$InputDirectory,
  [string]$OutputDirectory,
  [string]$Language = 'es',
  [switch]$ListLanguages
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType=WindowsRuntime]
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Foundation, ContentType=WindowsRuntime]
$null = [Windows.Graphics.Imaging.SoftwareBitmap, Windows.Foundation, ContentType=WindowsRuntime]
$null = [Windows.Globalization.Language, Windows.Globalization, ContentType=WindowsRuntime]
if ($ListLanguages) {
  [Windows.Media.Ocr.OcrEngine]::AvailableRecognizerLanguages | ForEach-Object { $_.LanguageTag }
  exit 0
}
if (!(Test-Path -LiteralPath $InputDirectory -PathType Container)) { throw 'Input directory does not exist' }
$taskMethod = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
  $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetGenericArguments().Count -eq 1 -and $_.GetParameters().Count -eq 1
} | Select-Object -First 1
function Wait-WinRT($Operation, [Type]$ResultType) {
  $task = $taskMethod.MakeGenericMethod($ResultType).Invoke($null, @($Operation))
  try { $task.Wait() } catch { throw $task.Exception.GetBaseException().Message }
  return $task.Result
}
$ocrLanguage = New-Object Windows.Globalization.Language $Language
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($ocrLanguage)
if ($null -eq $engine) { throw 'Requested OCR language is not installed' }
$null = New-Item -ItemType Directory -Force -Path $OutputDirectory
foreach ($entry in (Get-ChildItem -LiteralPath $InputDirectory -Filter '*.png' -File | Sort-Object Name)) {
  $destination = Join-Path $OutputDirectory ($entry.BaseName + '.json')
  if (Test-Path -LiteralPath $destination) { continue }
  $file = Wait-WinRT ([Windows.Storage.StorageFile]::GetFileFromPathAsync($entry.FullName)) ([Windows.Storage.StorageFile])
  $stream = Wait-WinRT ($file.OpenReadAsync()) ([Windows.Storage.Streams.IRandomAccessStreamWithContentType])
  $decoder = Wait-WinRT ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
  $bitmap = Wait-WinRT ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
  $result = Wait-WinRT ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
  $lines = @($result.Lines | ForEach-Object {
    @{text=$_.Text;words=@($_.Words | ForEach-Object {@{text=$_.Text;x=$_.BoundingRect.X;y=$_.BoundingRect.Y;width=$_.BoundingRect.Width;height=$_.BoundingRect.Height}})}
  })
  @{image=$entry.Name;language=$Language;width=$bitmap.PixelWidth;height=$bitmap.PixelHeight;text=$result.Text;lines=$lines} |
    ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $destination -Encoding UTF8
  $bitmap.Dispose()
  $stream.Dispose()
  Write-Output $entry.Name
}
