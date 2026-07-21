$blenderCandidates = @(@(
  (Get-Command blender.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1),
  (Get-ChildItem 'C:\Program Files\Blender Foundation\Blender *\blender.exe' -ErrorAction SilentlyContinue | Sort-Object FullName -Descending | Select-Object -ExpandProperty FullName -First 1)
) | Where-Object { $_ })

if ($blenderCandidates.Count -eq 0) { throw 'Blender CLI was not found. Install the official Blender desktop build.' }
$blender = $blenderCandidates[0]
$models = @{
  mp44 = 'public/models/1988-mclaren-mp4-4.glb'
  f2002 = 'public/models/2002-ferrari-f2002.glb'
  w11 = 'public/models/2020-mercedes-amg-w11.glb'
  rb19 = 'public/models/2023-red-bull-rb19.glb'
}

foreach ($car in $models.Keys) {
  & $blender --background --python scripts/blender/create-aero-guide-source.py -- --guide "public/aero-guides/$car.json" --model $models[$car] --out "CarModels/AeroGuides/$car.blend"
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
