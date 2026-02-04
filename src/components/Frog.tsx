import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FrogProps {
  position: [number, number, number]
  isHopping: boolean
  direction: [number, number]
}

export function Frog({ position, isHopping, direction }: FrogProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const bodyRef = useRef<THREE.Mesh>(null!)
  const leftLegRef = useRef<THREE.Group>(null!)
  const rightLegRef = useRef<THREE.Group>(null!)

  // Calculate rotation based on direction
  const targetRotation = useMemo(() => {
    if (direction[0] === 0 && direction[1] === 0) return 0
    return Math.atan2(direction[0], direction[1])
  }, [direction])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Smooth rotation
    const currentRotation = groupRef.current.rotation.y
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      currentRotation,
      targetRotation,
      delta * 10
    )

    // Breathing animation when idle
    if (!isHopping && bodyRef.current) {
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.02
      bodyRef.current.scale.y = 1 + breathe
      bodyRef.current.scale.x = 1 - breathe * 0.5
      bodyRef.current.scale.z = 1 - breathe * 0.5
    }

    // Leg animation during hop
    if (leftLegRef.current && rightLegRef.current) {
      const legAngle = isHopping ? Math.sin(state.clock.elapsedTime * 20) * 0.5 : 0
      leftLegRef.current.rotation.x = isHopping ? -0.5 + legAngle : 0
      rightLegRef.current.rotation.x = isHopping ? -0.5 - legAngle : 0
    }
  })

  const frogGreen = '#7cb518'
  const frogDark = '#5a8a12'
  const frogBelly = '#a8d957'
  const eyeWhite = '#f5f0e1'

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh ref={bodyRef} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={frogGreen} roughness={0.7} />
      </mesh>

      {/* Belly */}
      <mesh position={[0, -0.1, 0.15]} castShadow>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial color={frogBelly} roughness={0.8} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.15, 0.25]} castShadow>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial color={frogGreen} roughness={0.7} />
      </mesh>

      {/* Left Eye */}
      <group position={[-0.12, 0.35, 0.3]}>
        <mesh castShadow>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color={eyeWhite} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.02, 0.08]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
        </mesh>
        {/* Eye highlight */}
        <mesh position={[0.02, 0.05, 0.1]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Right Eye */}
      <group position={[0.12, 0.35, 0.3]}>
        <mesh castShadow>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color={eyeWhite} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.02, 0.08]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
        </mesh>
        {/* Eye highlight */}
        <mesh position={[-0.02, 0.05, 0.1]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Mouth line */}
      <mesh position={[0, 0.1, 0.45]} rotation={[0.3, 0, 0]}>
        <torusGeometry args={[0.08, 0.015, 8, 16, Math.PI]} />
        <meshStandardMaterial color={frogDark} />
      </mesh>

      {/* Left Front Leg */}
      <group ref={leftLegRef} position={[-0.25, -0.15, 0.1]}>
        <mesh castShadow rotation={[0, 0, -0.3]}>
          <capsuleGeometry args={[0.06, 0.2, 4, 8]} />
          <meshStandardMaterial color={frogGreen} roughness={0.7} />
        </mesh>
        <mesh position={[-0.08, -0.15, 0.05]} castShadow>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={frogDark} roughness={0.8} />
        </mesh>
      </group>

      {/* Right Front Leg */}
      <group ref={rightLegRef} position={[0.25, -0.15, 0.1]}>
        <mesh castShadow rotation={[0, 0, 0.3]}>
          <capsuleGeometry args={[0.06, 0.2, 4, 8]} />
          <meshStandardMaterial color={frogGreen} roughness={0.7} />
        </mesh>
        <mesh position={[0.08, -0.15, 0.05]} castShadow>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={frogDark} roughness={0.8} />
        </mesh>
      </group>

      {/* Left Back Leg */}
      <group position={[-0.2, -0.2, -0.2]}>
        <mesh castShadow rotation={[0.5, 0, -0.4]}>
          <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
          <meshStandardMaterial color={frogGreen} roughness={0.7} />
        </mesh>
        <mesh position={[-0.15, -0.25, -0.1]} castShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={frogDark} roughness={0.8} />
        </mesh>
      </group>

      {/* Right Back Leg */}
      <group position={[0.2, -0.2, -0.2]}>
        <mesh castShadow rotation={[0.5, 0, 0.4]}>
          <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
          <meshStandardMaterial color={frogGreen} roughness={0.7} />
        </mesh>
        <mesh position={[0.15, -0.25, -0.1]} castShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={frogDark} roughness={0.8} />
        </mesh>
      </group>
    </group>
  )
}
