"""Export named Blender guide curves as the runtime guide JSON format.

Open a car source scene from CarModels/AeroGuides/, keep the imported car in the
CAR_REFERENCE collection, and put only named Curve objects in AERO_GUIDES. The
objects are written in the raw model-local coordinate system; the web runtime
reuses the car calibration wrapper. This tool deliberately exports no mesh data.
"""

import bpy
import json
import os
import sys

FAMILIES = {"front-wing", "body-sidepod", "underfloor-diffuser", "rear-wing-wake", "top-chassis"}

def command_arguments():
    arguments = sys.argv
    return arguments[arguments.index("--") + 1:] if "--" in arguments else []

def value(arguments, name):
    index = arguments.index(name)
    return arguments[index + 1]

def curve_points(obj):
    if obj.type != "CURVE" or not obj.data.splines:
        raise ValueError(f"{obj.name}: expected a curve with at least one spline")
    spline = obj.data.splines[0]
    if spline.type == "BEZIER":
        points = [obj.matrix_world @ point.co for point in spline.bezier_points]
    else:
        points = [obj.matrix_world @ point.co.xyz for point in spline.points]
    if len(points) < 4:
        raise ValueError(f"{obj.name}: a guide needs at least four points")
    return [[round(point.x, 5), round(point.y, 5), round(point.z, 5)] for point in points]

arguments = command_arguments()
car_id = value(arguments, "--car")
source_model = value(arguments, "--source-model")
output = value(arguments, "--out")
collection = bpy.data.collections.get("AERO_GUIDES")
if collection is None:
    raise ValueError("The AERO_GUIDES collection is missing")

paths = []
for obj in sorted(collection.objects, key=lambda item: item.name):
    family = obj.get("aero_family")
    if family not in FAMILIES:
        raise ValueError(f"{obj.name}: aero_family must be one of {sorted(FAMILIES)}")
    paths.append({
        "id": obj.name.lower().replace(" ", "-"),
        "family": family,
        "points": curve_points(obj),
        "speed": float(obj.get("aero_speed", 0.22)),
        "phase": float(obj.get("aero_phase", 0)),
        "opacity": float(obj.get("aero_opacity", 0.62)),
        "tone": obj.get("aero_tone", "ice"),
    })

document = {
    "version": 1,
    "carId": car_id,
    "coordinateSpace": "model-local",
    "sourceModel": source_model,
    "paths": paths,
}
os.makedirs(os.path.dirname(output), exist_ok=True)
with open(output, "w", encoding="utf-8") as handle:
    json.dump(document, handle, indent=2)
    handle.write("\n")
