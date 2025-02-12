import express, { Request, Response } from 'express'
import cors from 'cors'
import multer from 'multer'
import * as tf from '@tensorflow/tfjs-node'
import { readFileSync, unlinkSync } from 'fs'

const app = express()
const upload = multer({ dest: 'uploads/' })

app.use(cors())
app.use(express.json())

let model: tf.LayersModel

async function loadModel(): Promise<void> {
  model = await tf.loadLayersModel('file://./model/model.json') // Get the model
  console.log('Model loaded!')
}
loadModel().catch((err) => console.error('Error loading model:', err))

app.post(
  // expects an image file and returns a JSON response with the predicted digit
  '/predict',
  upload.single('image'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image uploaded' })
        return
      }

      const imageBuffer: Buffer = readFileSync(req.file.path)
      const decoded = tf.node.decodeImage(imageBuffer, 1)

      let tensor: tf.Tensor3D
      if (decoded.rank === 3) {
        tensor = decoded as tf.Tensor3D
      } else if (decoded.rank === 4) {
        tensor = decoded.squeeze() as tf.Tensor3D
      } else {
        throw new Error('Unexpected data from decodeImage')
      }

      tensor = tf.image.resizeBilinear(tensor, [28, 28])

      const input: tf.Tensor4D = tensor.expandDims(0).div(255.0) as tf.Tensor4D
      const prediction = model.predict(input) as tf.Tensor
      const digit: number = prediction.argMax(1).dataSync()[0]

      // Remove the temporary uploaded file
      unlinkSync(req.file.path)

      res.json({ digit })
      return
    } catch (error) {
      console.error('Prediction error:', error)
      res.status(500).json({ error: 'Error processing the image' })
      return
    }
  }
)

const PORT: number = 5000
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`))
