export interface GameState {
  score: number
  lives: number
  isPlaying: boolean
  isGameOver: boolean
  currentLevel: number
}

export interface LilyPad {
  id: number
  position: [number, number, number]
  size: number
  isSafe: boolean
  isSinking?: boolean
}

export interface FrogProps {
  position: [number, number, number]
  isHopping: boolean
  onHopComplete: () => void
}
