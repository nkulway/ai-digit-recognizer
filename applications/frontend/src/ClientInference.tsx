import React, { useEffect, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import Canvas from './components/Canvas'

const ClientInference: React.FC = () => {
  const [model, setModel] = useState<tf.LayersModel | null>(null)
  const [prediction, setPrediction] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadModel() {
      try {
        const loadedModel = await tf.loadLayersModel('/model/model.json')
        setModel(loadedModel)
        console.log('Client-side model loaded.')
      } catch (error) {
        console.error('Error loading model:', error)
      }
    }
    loadModel()
  }, [])

  // Process the canvas drawing for inference
  const handleDrawEnd = (canvas: HTMLCanvasElement) => {
    if (!model) {
      setError('Model not loaded yet')
      return
    }

    setLoading(true)
    setError(null)
    // Convert canvas drawing to a blob then process it
    canvas.toBlob((blob) => {
      if (!blob) {
        setError('Could not process your drawing.')
        setLoading(false)
        return
      }

      // Create an image element from the blob so we can use tf.browser.fromPixels
      const img = new Image()
      img.src = URL.createObjectURL(blob)
      img.onload = async () => {
        try {
          // Convert the image to a tensor:
          // - Force grayscale by specifying 1 channel.
          // - Resize to 28x28 to match the model's expected input shape.
          const tensor = tf.browser
            .fromPixels(img, 1)
            .resizeNearestNeighbor([28, 28])
            .toFloat()
            .expandDims(0)
            .div(255.0)

          // Run inference using the loaded model
          const predictionTensor = model.predict(tensor) as tf.Tensor
          const predictedDigit = predictionTensor.argMax(1).dataSync()[0]
          setPrediction(predictedDigit)
        } catch (err) {
          setError('ERROR: An error occured during the prediction.')
          console.error(err)
        }
        setLoading(false)
      }
    })
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Client-Side Inference</h1>
      <p>
        {model
          ? 'Model loaded, ready to predict.'
          : 'Loading model... Please wait.'}
      </p>
      {loading && <p>Processing...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Canvas onDrawEnd={handleDrawEnd} onClear={() => setPrediction(null)} />
      <p style={{ fontSize: '1.5rem' }}>
        Prediction:{' '}
        {prediction !== null ? prediction : 'Draw a digit to see a prediction!'}
      </p>
    </div>
  )
}

export default ClientInference
