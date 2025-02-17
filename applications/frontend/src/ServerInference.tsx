import React, { useEffect, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import Canvas from './components/Canvas'
import axios from 'axios'

const ServerInference: React.FC = () => {
  const [model, setModel] = useState<tf.LayersModel | null>(null)
  const [prediction, setPrediction] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Load the TensorFlow.js model when the component mounts
  useEffect(() => {
    async function loadModel() {
      try {
        const loadedModel = await tf.loadLayersModel('/model/model.json')
        setModel(loadedModel)
        console.log('Server-side model loaded.')
      } catch (error) {
        console.error('Error loading model:', error)
      }
    }
    loadModel()
  }, [])

  const handleDrawEnd = (canvas: HTMLCanvasElement) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError('Model not loaded yet')
        return
      }

      setLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append('image', blob, 'digit.png')

      try {
        // Make a POST request to the backend's /predict endpoint
        const response = await axios.post(
          'http://localhost:5000/predict',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        )
        setPrediction(response.data.digit)
      } catch (error) {
        setError('ERROR: An error occured while making the prediction.')
        console.error(error)
      }
      setLoading(false)
    })
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Server-Side Inference</h1>
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

export default ServerInference
