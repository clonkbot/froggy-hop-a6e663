import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Water shader material
const waterVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uTime;

  void main() {
    vUv = uv;
    vPosition = position;

    vec3 pos = position;
    float wave1 = sin(pos.x * 0.5 + uTime * 0.5) * 0.1;
    float wave2 = sin(pos.z * 0.3 + uTime * 0.7) * 0.08;
    pos.y += wave1 + wave2;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const waterFragmentShader = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    float pattern = sin(vPosition.x * 2.0 + uTime * 0.3) * sin(vPosition.z * 2.0 + uTime * 0.4);
    pattern = (pattern + 1.0) * 0.5;

    vec3 color = mix(uColor1, uColor2, pattern * 0.3 + 0.2);

    // Add some sparkle
    float sparkle = pow(sin(vPosition.x * 10.0 + uTime) * sin(vPosition.z * 10.0 + uTime * 1.3), 20.0);
    color += vec3(sparkle * 0.3);

    gl_FragColor = vec4(color, 0.95);
  }
`

export function Pond() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color('#0d2f3f') },
    uColor2: { value: new THREE.Color('#1a5a5a') },
  }), [])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  // Create some decorative reeds around the pond
  const reeds = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2
      const radius = 18 + Math.random() * 4
      positions.push([
        Math.cos(angle) * radius + (Math.random() - 0.5) * 2,
        0,
        Math.sin(angle) * radius + (Math.random() - 0.5) * 2
      ])
    }
    return positions
  }, [])

  return (
    <>
      {/* Water surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
        <planeGeometry args={[50, 50, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={waterVertexShader}
          fragmentShader={waterFragmentShader}
          transparent
        />
      </mesh>

      {/* Pond floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0a1f2a" />
      </mesh>

      {/* Reeds around the edge */}
      {reeds.map((pos, i) => (
        <Reed key={i} position={pos} />
      ))}
    </>
  )
}

function Reed({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null!)
  const height = useMemo(() => 1.5 + Math.random() * 2, [])
  const swayOffset = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5 + swayOffset) * 0.1
      groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.7 + swayOffset) * 0.05
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.06, height, 6]} />
        <meshStandardMaterial color="#2d4a3a" roughness={0.9} />
      </mesh>
      {/* Reed top */}
      <mesh position={[0, height, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.04, 0.3, 6]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.95} />
      </mesh>
    </group>
  )
}
