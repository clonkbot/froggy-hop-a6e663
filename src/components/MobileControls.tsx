import { Html } from '@react-three/drei'

interface MobileControlsProps {
  onHop: (direction: [number, number]) => void
}

export function MobileControls({ onHop }: MobileControlsProps) {
  return (
    <Html
      fullscreen
      style={{
        pointerEvents: 'none',
      }}
    >
      <div className="mobile-controls">
        <button
          className="mobile-btn"
          onTouchStart={(e) => { e.preventDefault(); onHop([-1, 0]); }}
          onClick={() => onHop([-1, 0])}
          style={{ pointerEvents: 'auto' }}
        >
          ←
        </button>
        <div className="mobile-btn-row">
          <button
            className="mobile-btn"
            onTouchStart={(e) => { e.preventDefault(); onHop([0, -1]); }}
            onClick={() => onHop([0, -1])}
            style={{ pointerEvents: 'auto' }}
          >
            ↑
          </button>
          <button
            className="mobile-btn"
            onTouchStart={(e) => { e.preventDefault(); onHop([0, 1]); }}
            onClick={() => onHop([0, 1])}
            style={{ pointerEvents: 'auto' }}
          >
            ↓
          </button>
        </div>
        <button
          className="mobile-btn"
          onTouchStart={(e) => { e.preventDefault(); onHop([1, 0]); }}
          onClick={() => onHop([1, 0])}
          style={{ pointerEvents: 'auto' }}
        >
          →
        </button>
      </div>
    </Html>
  )
}
