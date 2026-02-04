import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useCallback, useEffect } from 'react'
import { OrbitControls, Environment, Stars, Float } from '@react-three/drei'
import { GameScene } from './components/GameScene'
import { GameUI } from './components/GameUI'
import { GameState } from './types'
import './styles.css'

function App() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    isPlaying: false,
    isGameOver: false,
    currentLevel: 1,
  })

  const startGame = useCallback(() => {
    setGameState({
      score: 0,
      lives: 3,
      isPlaying: true,
      isGameOver: false,
      currentLevel: 1,
    })
  }, [])

  const addScore = useCallback((points: number) => {
    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
    }))
  }, [])

  const loseLife = useCallback(() => {
    setGameState(prev => {
      const newLives = prev.lives - 1
      if (newLives <= 0) {
        return { ...prev, lives: 0, isGameOver: true, isPlaying: false }
      }
      return { ...prev, lives: newLives }
    })
  }, [])

  const resetGame = useCallback(() => {
    setGameState({
      score: 0,
      lives: 3,
      isPlaying: false,
      isGameOver: false,
      currentLevel: 1,
    })
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !gameState.isPlaying && !gameState.isGameOver) {
        startGame()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState.isPlaying, gameState.isGameOver, startGame])

  return (
    <div className="game-container">
      <Canvas
        camera={{ position: [0, 8, 12], fov: 50 }}
        shadows
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#0d1f2d']} />
        <fog attach="fog" args={['#0d1f2d', 15, 35]} />

        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[10, 15, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <pointLight position={[-5, 3, -5]} intensity={0.5} color="#f77f00" />

          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

          <GameScene
            gameState={gameState}
            addScore={addScore}
            loseLife={loseLife}
          />

          <Environment preset="sunset" />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={8}
            maxDistance={25}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>

      <GameUI
        gameState={gameState}
        startGame={startGame}
        resetGame={resetGame}
      />

      <footer className="footer">
        <span>Requested by <a href="https://twitter.com/OxPaulius" target="_blank" rel="noopener noreferrer">@OxPaulius</a> · Built by <a href="https://twitter.com/clonkbot" target="_blank" rel="noopener noreferrer">@clonkbot</a></span>
      </footer>
    </div>
  )
}

export default App
