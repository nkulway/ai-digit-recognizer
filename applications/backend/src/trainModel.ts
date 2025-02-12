import * as tf from '@tensorflow/tfjs-node'

interface MnistExample {
  input: number[]
  output: number[]
}

interface MnistSet {
  training: MnistExample[]
  test: MnistExample[]
}

async function loadMnistData(): Promise<{ xs: tf.Tensor4D; ys: tf.Tensor2D }> {
  const mnist: {
    set: (trainCount: number, testCount: number) => MnistSet
  } = require('mnist')
  const { training } = mnist.set(10000, 0)

  // extract images and labels from the training data
  const images: number[][] = training.map((d: MnistExample) => d.input)
  const labels: number[][] = training.map((d: MnistExample) => d.output)

  const xsFlat: tf.Tensor2D = tf.tensor2d(images, [images.length, 784])
  const xs: tf.Tensor4D = xsFlat.reshape([images.length, 28, 28, 1])
  const ys: tf.Tensor2D = tf.tensor2d(labels, [labels.length, 10])

  return { xs, ys }
}

export async function trainModel(): Promise<void> {
  console.log('Building and training the model...')

  // Build the CNN model
  const model = tf.sequential()
  model.add(
    tf.layers.conv2d({
      filters: 32,
      kernelSize: 3,
      activation: 'relu',
      inputShape: [28, 28, 1],
    })
  )
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }))
  model.add(tf.layers.flatten())
  model.add(tf.layers.dense({ units: 128, activation: 'relu' }))
  model.add(tf.layers.dense({ units: 10, activation: 'softmax' }))

  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  })

  const { xs, ys } = await loadMnistData()

  await model.fit(xs, ys, { epochs: 5 })
  console.log('Training complete. Saving model...')

  await model.save('file://./model')
  console.log('Model saved at ./model')
}

if (require.main === module) {
  trainModel().catch((err) => console.error(err))
}
