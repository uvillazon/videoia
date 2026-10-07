# Genera la locución del comercial UB Power con las voces de Windows (es-ES).
# Uso:  powershell -ExecutionPolicy Bypass -File tools/make_voice.ps1 [-Voice Pablo|Laura|Helena] [-Rate 1.12]
# Salida: public/ubpower/voz/01.wav ... 06.wav  (los textos coinciden con COPY.voice en src/ubpower/script.ts)
param(
  [string]$Voice = "Pablo",
  [double]$Rate = 1.2
)

$lines = @(
  "¿Tu auto no arranca?",
  "En U B Power tenemos la energía.",
  "La batería ideal para tu auto o moto.",
  "Baterías, luces LED, llantas y más.",
  "¡Diez por ciento de descuento en baterías Focus!",
  "U B Power: la energía que te pone en marcha."
)

$outDir = Join-Path $PSScriptRoot "..\public\ubpower\voz"
New-Item -ItemType Directory -Force $outDir | Out-Null

Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Media.SpeechSynthesis.SpeechSynthesizer, Windows.Media.SpeechSynthesis, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.DataReader, Windows.Storage.Streams, ContentType = WindowsRuntime]
$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
  $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
})[0]
function Await($op, [Type]$t) { $task = $asTask.MakeGenericMethod($t).Invoke($null, @($op)); $task.Wait() | Out-Null; $task.Result }

$synth = New-Object Windows.Media.SpeechSynthesis.SpeechSynthesizer
$synth.Voice = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices |
  Where-Object { $_.DisplayName -like "*$Voice*" } | Select-Object -First 1
if (-not $synth.Voice) { throw "No se encontró la voz '$Voice'" }

for ($i = 0; $i -lt $lines.Count; $i++) {
  $rateTxt = $Rate.ToString([Globalization.CultureInfo]::InvariantCulture)
  $ssml = "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='es-ES'><prosody rate='$rateTxt' pitch='-2%'>$($lines[$i])</prosody></speak>"
  $stream = Await ($synth.SynthesizeSsmlToStreamAsync($ssml)) ([Windows.Media.SpeechSynthesis.SpeechSynthesisStream])
  $reader = New-Object Windows.Storage.Streams.DataReader($stream.GetInputStreamAt(0))
  $size = [uint32]$stream.Size
  $null = Await ($reader.LoadAsync($size)) ([uint32])
  $bytes = New-Object byte[] $size
  $reader.ReadBytes($bytes)
  $file = Join-Path $outDir ("{0:D2}.wav" -f ($i + 1))
  [IO.File]::WriteAllBytes($file, $bytes)
  $byteRate = [BitConverter]::ToUInt32($bytes, 28)
  "{0:D2}.wav  {1:N2} s  {2}" -f ($i + 1), (($size - 44) / $byteRate), $lines[$i]
}
