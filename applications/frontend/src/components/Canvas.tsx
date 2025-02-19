import React, { useRef, useEffect, MouseEvent } from 'react'

interface CanvasProps {
  onDrawEnd: (canvas: HTMLCanvasElement) => void
  onClear?: () => void
}

const Canvas: React.FC<CanvasProps> = ({ onDrawEnd, onClear }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const initializeCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }

  useEffect(() => {
    initializeCanvas()
  }, [])

  const clearCanvas = () => {
    initializeCanvas()
    if (onClear) onClear()
  }

  // Start drawing when the user clicks on the canvas
  const startDrawing = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.lineWidth = 15
    ctx.lineCap = 'round'
    ctx.strokeStyle = 'white'

    const { offsetX, offsetY } = e.nativeEvent
    ctx.beginPath()
    ctx.moveTo(offsetX, offsetY)

    // Function to handle drawing on mouse move
    const draw = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top)
      ctx.stroke()
    }

    // Stop drawing and call onDrawEnd callback when mouse is released
    const stopDrawing = () => {
      document.removeEventListener('mousemove', draw as any)
      document.removeEventListener('mouseup', stopDrawing)
      onDrawEnd(canvas)
    }

    document.addEventListener('mousemove', draw as any)
    document.addEventListener('mouseup', stopDrawing)
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas
        ref={canvasRef}
        width={280}
        height={280}
        onMouseDown={startDrawing}
        style={{ border: '1px solid #000', display: 'block', margin: '0 auto' }}
      />
      <button onClick={clearCanvas} style={{ marginTop: '1rem' }}>
        Clear
      </button>
    </div>
  )
}

export default Canvas
