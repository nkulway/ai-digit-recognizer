// src/GradCAMVisualization.tsx
import React, { useState, useEffect } from 'react'
import * as tf from '@tensorflow/tfjs'
import Canvas from './components/Canvas'

// Compute Grad-CAM using tf.valueAndGrad and a manually built sub-model.
async function computeGradCAM(
  model: tf.LayersModel,
  inputTensor: tf.Tensor4D,
  targetLayerName: string,
  classIndex?: number
): Promise<tf.Tensor2D> {
  return tf.tidy(() => {
    // Build a sub-model for the convolutional layer output.
    const convLayer = model.getLayer(targetLayerName)
    if (!convLayer) {
      throw new Error(`Layer ${targetLayerName} not found.`)
    }
    // Get conv layer output from the full model.
    const convModel = tf.model({
      inputs: model.inputs,
      outputs: convLayer.output as tf.SymbolicTensor,
    })
    const convOutputs = convModel.predict(inputTensor) as tf.Tensor

    // Build a new functional model (restModel) for the layers after the conv layer.
    const convOutputShape = (convLayer.output as tf.SymbolicTensor).shape.slice(
      1
    )
    const newInput = tf.input({ shape: convOutputShape })
    let x = newInput
    const startIndex =
      model.layers.findIndex((layer) => layer.name === targetLayerName) + 1
    for (let i = startIndex; i < model.layers.length; i++) {
      x = model.layers[i].apply(x) as tf.SymbolicTensor
    }
    const restModel = tf.model({ inputs: newInput, outputs: x })

    // Compute full model predictions (for target class determination).
    const predictions = getPredictions(model, inputTensor)
    const targetClass =
      classIndex !== undefined
        ? classIndex
        : predictions.argMax(-1).dataSync()[0]

    // Define a function that takes convOutputs and runs them through the restModel.
    const fConv = (convOut: tf.Tensor): tf.Scalar => {
      const preds = restModel.predict(convOut) as tf.Tensor
      return preds.slice([0, targetClass], [-1, 1]).asScalar()
    }

    // Compute gradients of fConv with respect to convOutputs.
    const { grad } = tf.valueAndGrad(fConv)(convOutputs)
    // Average the gradients spatially (over height and width).
    const pooledGrads = grad.mean([0, 1])
    // Weight the convOutputs channels by the pooled gradients.
    const weightedConvOutputs = convOutputs.mul(pooledGrads)
    // Sum along the channels to produce the heatmap.
    let heatmap = weightedConvOutputs.sum(-1).relu()
    // Normalize the heatmap.
    const maxVal = heatmap.max()
    if (maxVal.dataSync()[0] !== 0) {
      heatmap = heatmap.div(maxVal)
    }
    return heatmap.squeeze() as tf.Tensor2D
  })
}

const getPredictions = (model: tf.LayersModel, inputTensor: tf.Tensor4D) => {
  return model.predict(inputTensor) as tf.Tensor
}

// Helper function to convert a heatmap tensor to a data URL using an offscreen canvas.
const convertHeatmapToDataURL = async (
  heatmap: tf.Tensor2D,
  width: number,
  height: number
): Promise<string> => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Unable to get canvas context.')

  const data = await heatmap.data()
  const imageData = ctx.createImageData(width, height)
  for (let i = 0; i < data.length; i++) {
    const value = Math.floor(data[i] * 255)
    // Use a simple red colormap: adjust as desired.
    imageData.data[i * 4 + 0] = value // red channel
    imageData.data[i * 4 + 1] = 0 // green channel
    imageData.data[i * 4 + 2] = 0 // blue channel
    imageData.data[i * 4 + 3] = 150 // alpha (transparency)
  }
  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL()
}

const GradCAMVisualization: React.FC<{ targetLayer: string }> = ({
  targetLayer,
}) => {
  const [model, setModel] = useState<tf.LayersModel | null>(null)
  const [heatmapUrl, setHeatmapUrl] = useState<string | null>(null)
  const [prediction, setPrediction] = useState<number | null>(null)

  // Load the model when the component mounts.
  useEffect(() => {
    async function loadModel() {
      try {
        const loadedModel = await tf.loadLayersModel('/model/model.json')
        setModel(loadedModel)
      } catch (error) {
        console.error('Error loading model:', error)
      }
    }
    loadModel()
  }, [])

  const handleDrawEnd = async (canvas: HTMLCanvasElement) => {
    if (!model) return

    canvas.toBlob((blob) => {
      if (!blob) {
        return
      }

      // Create an image element from the blob so we can use tf.browser.fromPixels
      const img = new Image()
      img.src = URL.createObjectURL(blob)
      img.onload = async () => {
        try {
          // Preprocess the canvas drawing to a tensor.
          const tensor = tf.browser
            .fromPixels(canvas, 1)
            .resizeNearestNeighbor([28, 28])
            .toFloat()
            .expandDims(0)
            .div(255.0) as tf.Tensor4D

          // Compute the Grad-CAM heatmap.
          const heatmap = await computeGradCAM(model, tensor, targetLayer)
          // Convert the heatmap to a data URL for display.
          const url = await convertHeatmapToDataURL(heatmap, 28, 28)
          setHeatmapUrl(url)
          const predictions = getPredictions(model, tensor)
          const prediction = predictions.argMax(1).dataSync()[0]
          setPrediction(prediction)
        } catch (error) {
          console.error('Grad-CAM error:', error)
        }
      }
    })
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Grad-CAM Visualization</h1>
      {!model ? (
        <p>Loading model...</p>
      ) : (
        <p>Model loaded, draw to visualize Grad-CAM.</p>
      )}
      <Canvas onDrawEnd={handleDrawEnd} onClear={() => setHeatmapUrl(null)} />
      <p style={{ fontSize: '1.5rem' }}>
        What the model thinks your digit is:{' '}
        {prediction !== null ? prediction : 'Draw a digit to see a prediction!'}
      </p>
      {heatmapUrl && (
        <div>
          <h2>Heatmap Overlay</h2>
          {prediction && (
            <p>
              <i>
                (Does this heatmap look like the number {prediction}? Not too
                accurate, huh?)
              </i>
            </p>
          )}
          <img
            src={heatmapUrl}
            alt="Grad-CAM Heatmap"
            style={{
              width: '200px',
              height: '200px',
              imageRendering: 'pixelated',
            }}
          />
        </div>
      )}
    </div>
  )
}

export default GradCAMVisualization
