import { GameState } from '../types'

interface GameUIProps {
  gameState: GameState
  startGame: () => void
  resetGame: () => void
}

export function GameUI({ gameState, startGame, resetGame }: GameUIProps) {
  const { score, lives, isPlaying, isGameOver } = gameState

  return (
    <div className="game-ui">
      {isPlaying && (
        <div className="game-hud">
          <div className="score-card">
            <div className="score-label">Score</div>
            <div className="score-value">{score}</div>
          </div>
          <div className="lives-container">
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className={`life-icon ${i >= lives ? 'lost' : ''}`}
              >
                🐸
              </span>
            ))}
          </div>
        </div>
      )}

      {!isPlaying && !isGameOver && (
        <div className="start-screen">
          <div className="frog-decoration">🐸</div>
          <h1 className="title">Froggy Hop!</h1>
          <p className="subtitle">Hop across the lily pads</p>
          <button className="start-button" onClick={startGame}>
            Start Game
          </button>
          <div className="controls-hint">
            <p><kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> to hop</p>
            <p>or <kbd>WASD</kbd> keys</p>
            <p style={{ marginTop: '8px', opacity: 0.7 }}>Touch controls on mobile</p>
          </div>
        </div>
      )}

      {isGameOver && (
        <div className="game-over-screen">
          <div className="frog-decoration" style={{ filter: 'grayscale(0.5)' }}>🐸</div>
          <h1 className="title" style={{ color: '#f77f00' }}>Game Over</h1>
          <div className="final-score">
            Final Score: <span>{score}</span>
          </div>
          <button className="restart-button" onClick={resetGame}>
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}
