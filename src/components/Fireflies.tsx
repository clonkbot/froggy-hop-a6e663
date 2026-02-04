import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Fireflies() {
  const pointsRef = useRef<THREE.Points>(null!)
  const count = 50

  const { positions, randomFactors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const randomFactors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      // Spread fireflies around the pond
      const angle = Math.random() * Math.PI * 2
      const radius = 5 + Math.random() * 12
      positions[i3] = Math.cos(angle) * radius
      positions[i3 + 1] = 0.5 + Math.random() * 2
      positions[i3 + 2] = Math.sin(angle) * radius

      // Random factors for unique movement
      randomFactors[i3] = Math.random()
      randomFactors[i3 + 1] = Math.random()
      randomFactors[i3 + 2] = Math.random()
    }

    return { positions, randomFactors }
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return

    const time = state.clock.elapsedTime
    const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const rx = randomFactors[i3]
      const ry = randomFactors[i3 + 1]
      const rz = randomFactors[i3 + 2]

      // Gentle floating motion
      positionsArray[i3] = positions[i3] + Math.sin(time * 0.5 * (rx + 0.5)) * 0.5
      positionsArray[i3 + 1] = positions[i3 + 1] + Math.sin(time * (ry + 0.5)) * 0.3
      positionsArray[i3 + 2] = positions[i3 + 2] + Math.cos(time * 0.4 * (rz + 0.5)) * 0.5
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#f7d747"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
