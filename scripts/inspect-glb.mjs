import { readFile, readdir } from 'node:fs/promises'
import { extname, relative, resolve } from 'node:path'
import { Box3, Matrix4, Quaternion, Vector3 } from 'three'

const root = resolve(process.cwd(), 'CarModels')

async function findGlbFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve(directory, entry.name)
      if (entry.isDirectory()) return findGlbFiles(entryPath)
      return extname(entry.name).toLowerCase() === '.glb' ? [entryPath] : []
    }),
  )

  return nested.flat()
}

function parseGlb(buffer, filename) {
  if (buffer.readUInt32LE(0) !== 0x46546c67) throw new Error(`${filename} is not a binary glTF file.`)
  if (buffer.readUInt32LE(4) !== 2) throw new Error(`${filename} is not glTF 2.0.`)

  let offset = 12
  let json
  let binaryChunk

  while (offset < buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset)
    const chunkType = buffer.readUInt32LE(offset + 4)
    const chunk = buffer.subarray(offset + 8, offset + 8 + chunkLength)

    if (chunkType === 0x4e4f534a) json = JSON.parse(chunk.toString('utf8').trim())
    if (chunkType === 0x004e4942) binaryChunk = chunk
    offset += 8 + chunkLength
  }

  if (!json) throw new Error(`${filename} has no JSON chunk.`)
  return { json, binaryChunk }
}

function nodeMatrix(node) {
  if (node.matrix) return new Matrix4().fromArray(node.matrix)

  return new Matrix4().compose(
    new Vector3(...(node.translation ?? [0, 0, 0])),
    new Quaternion(...(node.rotation ?? [0, 0, 0, 1])),
    new Vector3(...(node.scale ?? [1, 1, 1])),
  )
}

function primitiveTriangleCount(primitive, accessors) {
  const vertexCount = primitive.indices === undefined
    ? accessors[primitive.attributes.POSITION]?.count ?? 0
    : accessors[primitive.indices]?.count ?? 0
  const mode = primitive.mode ?? 4

  if (mode === 4) return Math.floor(vertexCount / 3)
  if (mode === 5 || mode === 6) return Math.max(0, vertexCount - 2)
  return 0
}

function imageDimensions(image, json, binaryChunk) {
  if (!binaryChunk || image.bufferView === undefined) return null
  const view = json.bufferViews?.[image.bufferView]
  if (!view) return null

  const bytes = binaryChunk.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength)
  const mimeType = image.mimeType ?? ''

  if (mimeType === 'image/png' && bytes.subarray(1, 4).toString('ascii') === 'PNG') {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), mimeType }
  }

  if (mimeType === 'image/jpeg' || (bytes[0] === 0xff && bytes[1] === 0xd8)) {
    let offset = 2
    while (offset < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1
        continue
      }
      const marker = bytes[offset + 1]
      const length = bytes.readUInt16BE(offset + 2)
      if (marker >= 0xc0 && marker <= 0xc3) {
        return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5), mimeType: 'image/jpeg' }
      }
      offset += 2 + length
    }
  }

  return { width: null, height: null, mimeType: mimeType || 'unknown' }
}

function inspectFile(filename) {
  return readFile(filename).then((buffer) => {
    const { json, binaryChunk } = parseGlb(buffer, filename)
    const accessors = json.accessors ?? []
    const meshes = json.meshes ?? []
    const nodes = json.nodes ?? []
    const scenes = json.scenes ?? []
    const rootNodes = scenes[json.scene ?? 0]?.nodes ?? []
    const bounds = new Box3()
    let positionAccessorsWithoutBounds = 0
    let quantizedPositionAccessors = 0
    let primitiveCount = 0
    let vertexCount = 0
    let triangleCount = 0

    const visit = (nodeIndex, parentMatrix) => {
      const node = nodes[nodeIndex]
      if (!node) return
      const worldMatrix = parentMatrix.clone().multiply(nodeMatrix(node))

      if (node.mesh !== undefined) {
        for (const primitive of meshes[node.mesh]?.primitives ?? []) {
          primitiveCount += 1
          const positionAccessor = accessors[primitive.attributes.POSITION]
          vertexCount += positionAccessor?.count ?? 0
          triangleCount += primitiveTriangleCount(primitive, accessors)

          const needsRuntimeDecode = positionAccessor?.normalized || positionAccessor?.componentType !== 5126
          if (needsRuntimeDecode) quantizedPositionAccessors += 1

          if (positionAccessor?.min && positionAccessor?.max && !needsRuntimeDecode) {
            bounds.union(new Box3(new Vector3(...positionAccessor.min), new Vector3(...positionAccessor.max)).applyMatrix4(worldMatrix))
          } else if (!positionAccessor?.min || !positionAccessor?.max) {
            positionAccessorsWithoutBounds += 1
          }
        }
      }

      for (const childIndex of node.children ?? []) visit(childIndex, worldMatrix)
    }

    for (const rootNodeIndex of rootNodes) visit(rootNodeIndex, new Matrix4())

    const images = (json.images ?? []).map((image) => imageDimensions(image, json, binaryChunk))
    const knownImageSizes = images.filter((image) => image?.width && image?.height)
    const maxTextureDimension = knownImageSizes.reduce((largest, image) => Math.max(largest, image.width, image.height), 0)
    const externalResources = [
      ...(json.buffers ?? []).flatMap((entry) => entry.uri ? [entry.uri] : []),
      ...(json.images ?? []).flatMap((entry) => entry.uri && !entry.uri.startsWith('data:') ? [entry.uri] : []),
    ]

    const size = new Vector3()
    if (!bounds.isEmpty()) bounds.getSize(size)

    return {
      file: relative(process.cwd(), filename),
      sizeMiB: Number((buffer.length / 1024 / 1024).toFixed(2)),
      meshCount: meshes.length,
      nodeCount: nodes.length,
      primitiveCount,
      vertexCount,
      triangleCount,
      materialCount: (json.materials ?? []).length,
      imageCount: (json.images ?? []).length,
      maxTextureDimension: maxTextureDimension || null,
      externalResourceCount: externalResources.length,
      positionAccessorsWithoutBounds,
      quantizedPositionAccessors,
      worldBounds: quantizedPositionAccessors > 0 || bounds.isEmpty()
        ? null
        : {
            min: bounds.min.toArray().map((value) => Number(value.toFixed(3))),
            max: bounds.max.toArray().map((value) => Number(value.toFixed(3))),
            dimensions: size.toArray().map((value) => Number(value.toFixed(3))),
          },
      extensionsUsed: json.extensionsUsed ?? [],
    }
  })
}

const files = process.argv.slice(2).length > 0 ? process.argv.slice(2).map((file) => resolve(file)) : await findGlbFiles(root)
const reports = await Promise.all(files.sort().map(inspectFile))

console.log(JSON.stringify(reports, null, 2))
