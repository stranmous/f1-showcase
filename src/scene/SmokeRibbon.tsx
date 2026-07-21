import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

// ---------- types ----------

export type StrandStyle = {
  /** Base half-width in model-local units — should be hair-thin (0.003–0.02) */
  width: number
  /** Peak opacity for this individual strand */
  opacity: number
  /** Turbulence intensity at the path tail (0 = laminar, 1 = heavy) */
  turbulence: number
  /** Flow animation speed multiplier */
  flowSpeed: number
  /** Phase offset for staggering sibling strands */
  phase: number
}

export type SmokeStrandProps = {
  curve: THREE.CatmullRomCurve3
  style: StrandStyle
  /** Number of segments along the curve */
  segments: number
  reducedMotion: boolean
}

// ---------- geometry builder ----------

/**
 * Builds a flat ribbon strip along `curve` — designed to be hair-thin.
 * The ribbon lies in the curve's Frenet normal plane with constant width.
 * Per-vertex attributes:
 *   position, uv, aProgress (0→1 along path), aEdge (-1→+1 across width)
 */
function buildStrandGeometry(
  curve: THREE.CatmullRomCurve3,
  segments: number,
  width: number,
) {
  const vertexCount = (segments + 1) * 2
  const positions = new Float32Array(vertexCount * 3)
  const uvs = new Float32Array(vertexCount * 2)
  const progresses = new Float32Array(vertexCount)
  const edges = new Float32Array(vertexCount)

  const point = new THREE.Vector3()
  const tangent = new THREE.Vector3()
  const binormal = new THREE.Vector3()
  const up = new THREE.Vector3(0, 1, 0)

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    curve.getPointAt(t, point)
    curve.getTangentAt(t, tangent).normalize()

    // Compute Frenet-like frame using world up as reference
    binormal.crossVectors(tangent, up).normalize()
    // If tangent is parallel to up, fall back to X axis
    if (binormal.lengthSq() < 0.001) {
      binormal.set(1, 0, 0)
    }

    const halfWidth = width

    // Left vertex (index i*2)
    const li = i * 2
    positions[li * 3] = point.x - binormal.x * halfWidth
    positions[li * 3 + 1] = point.y - binormal.y * halfWidth
    positions[li * 3 + 2] = point.z - binormal.z * halfWidth
    uvs[li * 2] = 0
    uvs[li * 2 + 1] = t
    progresses[li] = t
    edges[li] = -1

    // Right vertex (index i*2+1)
    const ri = li + 1
    positions[ri * 3] = point.x + binormal.x * halfWidth
    positions[ri * 3 + 1] = point.y + binormal.y * halfWidth
    positions[ri * 3 + 2] = point.z + binormal.z * halfWidth
    uvs[ri * 2] = 1
    uvs[ri * 2 + 1] = t
    progresses[ri] = t
    edges[ri] = 1
  }

  // Triangle strip indices
  const indexCount = segments * 6
  const indices = new Uint16Array(indexCount)
  for (let i = 0; i < segments; i++) {
    const base = i * 2
    const idx = i * 6
    indices[idx] = base
    indices[idx + 1] = base + 1
    indices[idx + 2] = base + 2
    indices[idx + 3] = base + 1
    indices[idx + 4] = base + 3
    indices[idx + 5] = base + 2
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setIndex(new THREE.BufferAttribute(indices, 1))
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geometry.setAttribute('aProgress', new THREE.BufferAttribute(progresses, 1))
  geometry.setAttribute('aEdge', new THREE.BufferAttribute(edges, 1))
  return geometry
}

// ---------- shader ----------

const strandVertexShader = /* glsl */ `
  attribute float aProgress;
  attribute float aEdge;

  uniform float uTime;
  uniform float uFlowSpeed;
  uniform float uPhase;
  uniform float uTurbulence;

  varying float vProgress;
  varying float vEdge;
  varying vec2 vUv;

  // Simplex-like 3D noise (compact, GPU-friendly)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  vec3 snoiseVec3(vec3 x){
    float s  = snoise(vec3(x));
    float s1 = snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
    float s2 = snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
    return vec3(s, s1, s2);
  }

  vec3 curlNoise(vec3 p) {
    const float e = 0.1;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);

    vec3 p_x0 = snoiseVec3(p - dx);
    vec3 p_x1 = snoiseVec3(p + dx);
    vec3 p_y0 = snoiseVec3(p - dy);
    vec3 p_y1 = snoiseVec3(p + dy);
    vec3 p_z0 = snoiseVec3(p - dz);
    vec3 p_z1 = snoiseVec3(p + dz);

    float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
    float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
    float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

    const float divisor = 1.0 / (2.0 * e);
    return normalize(vec3(x, y, z) * divisor);
  }

  void main() {
    vProgress = aProgress;
    vEdge = aEdge;
    vUv = uv;

    // Turbulence increases quadratically along the path (laminar → turbulent)
    float turbAmount = uTurbulence * aProgress * aProgress;

    // Animate noise sampling — flow scrolls along path
    float flowPhase = uTime * uFlowSpeed + uPhase;
    vec3 noiseCoord = position + vec3(flowPhase * 0.15, flowPhase * 0.1, flowPhase * 0.6);

    // Displace position by fluid vortex swirls (Curl Noise)
    vec3 curl = curlNoise(noiseCoord * 3.5);
    vec3 displaced = position + curl * turbAmount * 0.15;

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const strandFragmentShader = /* glsl */ `
  uniform float uOpacity;
  uniform float uTurbulence;
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uFlowSpeed;
  uniform float uPhase;

  varying float vProgress;
  varying float vEdge;
  varying vec2 vUv;

  void main() {
    // Edge fade — soft falloff toward ribbon edges (hair-thin so this is subtle)
    float edgeFade = 1.0 - abs(vEdge);
    edgeFade = smoothstep(0.0, 0.6, edgeFade);

    // Progress envelope — smooth fade in and long smooth fade out at the very ends of the path
    float headFade = smoothstep(0.0, 0.12, vProgress);
    float tailFade = 1.0 - smoothstep(0.3, 1.0, vProgress);
    float pathEnvelope = headFade * tailFade;

    // Subtle flowing pulse to visualize front-to-back speed without breaking the ribbon
    float dashCount = 2.0; 
    float flowCycle = fract(vProgress * dashCount - uTime * uFlowSpeed * 1.5 + uPhase);
    float flowPulse = 0.5 + 0.5 * sin(flowCycle * 6.28318);

    // Combine
    float alpha = uOpacity * edgeFade * pathEnvelope * flowPulse;
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(uColor, alpha);
  }
`

// ---------- component ----------

export function SmokeStrand({
  curve,
  style,
  segments,
  reducedMotion,
}: SmokeStrandProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const staticFramePlaced = useRef(false)

  const geometry = useMemo(
    () => buildStrandGeometry(curve, segments, style.width),
    [curve, segments, style.width],
  )

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: strandVertexShader,
        fragmentShader: strandFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uFlowSpeed: { value: style.flowSpeed },
          uPhase: { value: style.phase },
          uOpacity: { value: style.opacity },
          uTurbulence: { value: style.turbulence },
          uColor: { value: new THREE.Color('#e8f0f8') },
        },
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [style.flowSpeed, style.phase, style.opacity, style.turbulence],
  )

  useEffect(() => {
    materialRef.current = material
  }, [material])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  useFrame(({ clock }) => {
    const mat = materialRef.current
    if (!mat) return
    if (reducedMotion && staticFramePlaced.current) return
    mat.uniforms.uTime.value = reducedMotion ? 1.8 : clock.getElapsedTime()
    staticFramePlaced.current = true
  })

  return (
    <mesh
      ref={meshRef}
      frustumCulled={false}
      geometry={geometry}
      material={material}
      renderOrder={2}
    />
  )
}
