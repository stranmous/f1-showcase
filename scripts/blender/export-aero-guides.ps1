param(
  [Parameter(Mandatory = $true)] [ValidateSet('mp44', 'f2002', 'w11', 'rb19')] [string]$Car,
  [Parameter(Mandatory = $true)] [string]$BlendFile
)

$blenderCandidates = @(@(
  (Get-Command blender.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1),
  (Get-ChildItem 'C:\Program Files\Blender Foundation\Blender *\blender.exe' -ErrorAction SilentlyContinue | Sort-Object FullName -Descending | Select-Object -ExpandProperty FullName -First 1)
) | Where-Object { $_ })
if ($blenderCandidates.Count -eq 0) { throw 'Blender CLI was not found. Install the official Blender desktop build.' }
$blender = $blenderCandidates[0]
$sourceModels = @{
  mp44 = '/models/1988-mclaren-mp4-4.glb'
  f2002 = '/models/2002-ferrari-f2002.glb'
  w11 = '/models/2020-mercedes-amg-w11.glb'
  rb19 = '/models/2023-red-bull-rb19.glb'
}

& $blender --background $BlendFile --python scripts/blender/export-aero-guides.py -- --car $Car --source-model $sourceModels[$Car] --out "public/aero-guides/$Car.json"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
