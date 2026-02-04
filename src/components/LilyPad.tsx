import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import { LilyPad } from '../types'

interface LilyPadMeshProps {
  pad: LilyPad
  isVisited: boolean
}

export function LilyPadMesh({ pad, isVisited }: LilyPadMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const sinkProgress = useRef(0)

  // Create lily pad shape
  const lilyPadShape = useMemo(() => {
    const shape = new THREE.Shape()
    const radius = pad.size * 0.5
    const segments = 32
    const notchAngle = Math.PI * 0.15

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2

      // Create a notch (bite) in the lily pad
      if (angle > Math.PI - notchAngle && angle < Math.PI + notchAngle) {
        const notchDepth = 0.3
        const r = radius * (1 - notchDepth * Math.sin((angle - Math.PI + notchAngle) / (notchAngle * 2) * Math.PI))
        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * r
        if (i === 0) {
          shape.moveTo(x, y)
        } else {
          shape.lineTo(x, y)
        }
      } else {
        // Slight waviness on the edges
        const wave = 1 + Math.sin(angle * 8) * 0.03
        const x = Math.cos(angle) * radius * wave
        const y = Math.sin(angle) * radius * wave
        if (i === 0) {
          shape.moveTo(x, y)
        } else {
          shape.lineTo(x, y)
        }
      }
    }

    return shape
  }, [pad.size])

  // Animation for sinking pads
  useFrame((_, delta) => {
    if (pad.isSinking && meshRef.current) {
      sinkProgress.current += delta * 2
      meshRef.current.position.y = -sinkProgress.current * 2
      meshRef.current.rotation.x = sinkProgress.current * 0.5
      meshRef.current.scale.setScalar(Math.max(0, 1 - sinkProgress.current * 0.5))
    }
  })

  const baseColor = pad.isSafe ? '#4a7c59' : '#5a6c49'
  const visitedColor = '#5d9a6d'
  const color = isVisited ? visitedColor : baseColor

  return (
    <Float
      speed={1.5 + Math.random()}
      rotationIntensity={0.05}
      floatIntensity={0.1}
      enabled={!pad.isSinking}
    >
      <group position={pad.position}>
        {/* Main lily pad */}
        <mesh
          ref={meshRef}
          rotation={[-Math.PI / 2, 0, Math.random() * Math.PI * 2]}
          receiveShadow
          castShadow
        >
          <extrudeGeometry
            args={[lilyPadShape, {
              depth: 0.05,
              bevelEnabled: true,
              bevelThickness: 0.02,
              bevelSize: 0.02,
              bevelSegments: 3
            }]}
          />
          <meshStandardMaterial
            color={color}
            roughness={0.8}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Veins pattern */}
        {pad.isSafe && (
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.03, 0]}
          >
            <ringGeometry args={[0, pad.size * 0.4, 6, 1]} />
            <meshStandardMaterial
              color="#3d6a4a"
              transparent
              opacity={0.5}
              wireframe
            />
          </mesh>
        )}

        {/* Flower on some pads */}
        {Math.random() > 0.7 && pad.isSafe && (
          <group position={[pad.size * 0.25, 0.1, pad.size * 0.2]}>
            {/* Flower petals */}
            {[...Array(5)].map((_, i) => (
              <mesh
                key={i}
                position={[
                  Math.cos((i / 5) * Math.PI * 2) * 0.08,
                  0,
                  Math.sin((i / 5) * Math.PI * 2) * 0.08
                ]}
                rotation={[-Math.PI / 2, 0, (i / 5) * Math.PI * 2]}
              >
                <circleGeometry args={[0.06, 8]} />
                <meshStandardMaterial
                  color="#f5a5c8"
                  side={THREE.DoubleSide}
                />
              </mesh>
            ))}
            {/* Flower center */}
            <mesh position={[0, 0.02, 0]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color="#f7d747" />
            </mesh>
          </group>
        )}

        {/* Warning indicator for unsafe pads */}
        {!pad.isSafe && (
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color="#f77f00"
              emissive="#f77f00"
              emissiveIntensity={0.5}
              transparent
              opacity={0.6}
            />
          </mesh>
        )}
      </group>
    </Float>
  )
}
