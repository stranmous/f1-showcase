"""Create editable Blender guide sources from approved model-local JSON data."""

import bpy
import json
import os
import sys

def command_arguments():
    arguments = sys.argv
    return arguments[arguments.index("--") + 1:] if "--" in arguments else []

def value(arguments, name):
    return arguments[arguments.index(name) + 1]

def collection(name):
    entry = bpy.data.collections.get(name)
    if entry is None:
        entry = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(entry)
    return entry

def move_to_collection(obj, target):
    for existing in list(obj.users_collection):
        existing.objects.unlink(obj)
    target.objects.link(obj)

arguments = command_arguments()
guide_file = value(arguments, "--guide")
model_file = value(arguments, "--model")
output = value(arguments, "--out")

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
for existing in list(bpy.data.collections):
    bpy.data.collections.remove(existing)

reference = collection("CAR_REFERENCE")
guides = collection("AERO_GUIDES")
bpy.ops.import_scene.gltf(filepath=model_file)
for obj in list(bpy.context.selected_objects):
    move_to_collection(obj, reference)
    obj.hide_render = True
reference.hide_render = True

with open(guide_file, "r", encoding="utf-8") as handle:
    document = json.load(handle)

for entry in document["paths"]:
    curve = bpy.data.curves.new(entry["id"], type="CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 12
    curve.bevel_depth = 0.008
    curve.bevel_resolution = 2
    spline = curve.splines.new("POLY")
    spline.points.add(len(entry["points"]) - 1)
    for point, coordinates in zip(spline.points, entry["points"]):
        point.co = (*coordinates, 1)
    obj = bpy.data.objects.new(entry["id"], curve)
    guides.objects.link(obj)
    obj["aero_family"] = entry["family"]
    obj["aero_speed"] = entry["speed"]
    obj["aero_phase"] = entry["phase"]
    obj["aero_opacity"] = entry["opacity"]
    obj["aero_tone"] = entry["tone"]

bpy.context.scene["aero_guide_car_id"] = document["carId"]
bpy.context.scene["aero_guide_coordinate_space"] = document["coordinateSpace"]
bpy.context.scene["aero_guide_source_model"] = document["sourceModel"]
os.makedirs(os.path.dirname(output), exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=output)
