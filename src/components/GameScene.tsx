import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import { GameState, LilyPad } from '../types'
import { Frog } from './Frog'
import { LilyPadMesh } from './LilyPad'
import { Pond } from './Pond'
import { Fireflies } from './Fireflies'
import { MobileControls } from './MobileControls'

interface GameSceneProps {
  gameState: GameState
  addScore: (points: number) => void
  loseLife: () => void
}

const GRID_SIZE = 7
const CELL_SIZE = 2.5

function generateLilyPads(): LilyPad[] {
  const pads: LilyPad[] = []
  let id = 0

  // Starting pad (always safe)
  pads.push({
    id: id++,
    position: [0, 0, 0],
    size: 1.2,
    isSafe: true,
  })

  // Generate random lily pads in a grid pattern
  for (let z = -GRID_SIZE; z <= GRID_SIZE; z++) {
    for (let x = -GRID_SIZE; x <= GRID_SIZE; x++) {
      if (x === 0 && z === 0) continue // Skip starting position

      // Random chance to place a lily pad
      if (Math.random() > 0.4) {
        const offsetX = (Math.random() - 0.5) * 0.8
        const offsetZ = (Math.random() - 0.5) * 0.8
        pads.push({
          id: id++,
          position: [x * CELL_SIZE + offsetX, 0, z * CELL_SIZE + offsetZ],
          size: 0.8 + Math.random() * 0.5,
          isSafe: Math.random() > 0.15, // 15% chance of sinking pad
          isSinking: false,
        })
      }
    }
  }

  return pads
}

export function GameScene({ gameState, addScore, loseLife }: GameSceneProps) {
  const [frogPosition, setFrogPosition] = useState<[number, number, number]>([0, 0.5, 0])
  const [targetPosition, setTargetPosition] = useState<[number, number, number]>([0, 0.5, 0])
  const [isHopping, setIsHopping] = useState(false)
  const [lilyPads, setLilyPads] = useState<LilyPad[]>(() => generateLilyPads())
  const [visitedPads, setVisitedPads] = useState<Set<number>>(new Set([0]))
  const hopProgress = useRef(0)
  const hopStartPos = useRef<THREE.Vector3>(new THREE.Vector3())

  // Reset game when starting
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isGameOver) {
      setFrogPosition([0, 0.5, 0])
      setTargetPosition([0, 0.5, 0])
      setLilyPads(generateLilyPads())
      setVisitedPads(new Set([0]))
      hopProgress.current = 0
    }
  }, [gameState.isPlaying, gameState.isGameOver])

  const findNearestPadInDirection = useCallback((direction: [number, number]) => {
    const [dx, dz] = direction
    const currentX = frogPosition[0]
    const currentZ = frogPosition[2]

    let nearestPad: LilyPad | null = null
    let nearestDist = Infinity

    for (const pad of lilyPads) {
      const padX = pad.position[0]
      const padZ = pad.position[2]

      const relX = padX - currentX
      const relZ = padZ - currentZ

      // Check if pad is in the right direction
      const dotProduct = relX * dx + relZ * dz
      if (dotProduct < 0.5) continue // Must be mostly in the direction

      // Check if pad is close enough laterally
      const perpDist = Math.abs(relX * (-dz) + relZ * dx)
      if (perpDist > 2) continue

      const dist = Math.sqrt(relX * relX + relZ * relZ)
      if (dist < 0.5) continue // Skip current pad
      if (dist > 4) continue // Too far

      if (dist < nearestDist) {
        nearestDist = dist
        nearestPad = pad
      }
    }

    return nearestPad
  }, [frogPosition, lilyPads])

  const hop = useCallback((direction: [number, number]) => {
    if (!gameState.isPlaying || isHopping) return

    const targetPad = findNearestPadInDirection(direction)

    if (targetPad) {
      hopStartPos.current.set(frogPosition[0], frogPosition[1], frogPosition[2])
      setTargetPosition([targetPad.position[0], 0.5, targetPad.position[2]])
      setIsHopping(true)
      hopProgress.current = 0

      // Check if it's a new pad
      if (!visitedPads.has(targetPad.id)) {
        setVisitedPads(prev => new Set(prev).add(targetPad.id))
        addScore(10)
      }

      // Handle sinking pads
      if (!targetPad.isSafe) {
        setTimeout(() => {
          setLilyPads(prev => prev.map(p =>
            p.id === targetPad.id ? { ...p, isSinking: true } : p
          ))
          setTimeout(() => {
            loseLife()
            // Reset to starting position
            setFrogPosition([0, 0.5, 0])
            setTargetPosition([0, 0.5, 0])
          }, 500)
        }, 300)
      }
    } else {
      // No pad found - hop into water and lose life
      hopStartPos.current.set(frogPosition[0], frogPosition[1], frogPosition[2])
      const waterTarget: [number, number, number] = [
        frogPosition[0] + direction[0] * 2,
        -0.5,
        frogPosition[2] + direction[1] * 2
      ]
      setTargetPosition(waterTarget)
      setIsHopping(true)
      hopProgress.current = 0

      setTimeout(() => {
        loseLife()
        setFrogPosition([0, 0.5, 0])
        setTargetPosition([0, 0.5, 0])
        setIsHopping(false)
      }, 600)
    }
  }, [gameState.isPlaying, isHopping, findNearestPadInDirection, frogPosition, visitedPads, addScore, loseLife])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          hop([0, -1])
          break
        case 'ArrowDown':
        case 'KeyS':
          hop([0, 1])
          break
        case 'ArrowLeft':
        case 'KeyA':
          hop([-1, 0])
          break
        case 'ArrowRight':
        case 'KeyD':
          hop([1, 0])
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState.isPlaying, hop])

  // Animation loop for hopping
  useFrame((_, delta) => {
    if (isHopping) {
      hopProgress.current += delta * 3

      if (hopProgress.current >= 1) {
        hopProgress.current = 1
        setIsHopping(false)
        setFrogPosition(targetPosition)
      } else {
        const t = hopProgress.current
        const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

        const newX = hopStartPos.current.x + (targetPosition[0] - hopStartPos.current.x) * easeT
        const newZ = hopStartPos.current.z + (targetPosition[2] - hopStartPos.current.z) * easeT

        // Parabolic hop height
        const hopHeight = Math.sin(t * Math.PI) * 1.5
        const newY = 0.5 + hopHeight

        setFrogPosition([newX, newY, newZ])
      }
    }
  })

  const visibleLilyPads = useMemo(() => {
    return lilyPads.filter(pad => !pad.isSinking || pad.position[1] > -2)
  }, [lilyPads])

  return (
    <>
      <Pond />

      {visibleLilyPads.map(pad => (
        <LilyPadMesh
          key={pad.id}
          pad={pad}
          isVisited={visitedPads.has(pad.id)}
        />
      ))}

      <Frog
        position={frogPosition}
        isHopping={isHopping}
        direction={[
          targetPosition[0] - frogPosition[0],
          targetPosition[2] - frogPosition[2]
        ]}
      />

      <Fireflies />

      {/* Decorative elements */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[-8, 0.5, -6]}>
          <cylinderGeometry args={[0.1, 0.15, 2, 8]} />
          <meshStandardMaterial color="#2d5a3d" />
        </mesh>
        <mesh position={[-8, 1.5, -6]}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial color="#3d7a4d" />
        </mesh>
      </Float>

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh position={[7, 0.3, 5]}>
          <cylinderGeometry args={[0.08, 0.12, 1.5, 8]} />
          <meshStandardMaterial color="#2d5a3d" />
        </mesh>
        <mesh position={[7, 1.1, 5]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#4d8a5d" />
        </mesh>
      </Float>

      {gameState.isPlaying && (
        <MobileControls onHop={hop} />
      )}
    </>
  )
}
