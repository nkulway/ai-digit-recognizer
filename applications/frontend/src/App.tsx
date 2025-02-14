// src/App.tsx
import React, { useState } from "react";
import Canvas from "./components/Canvas";
import axios from "axios";

const App: React.FC = () => {
  const [prediction, setPrediction] = useState<number | null>(null);

  // This function is called when the drawing is finished.
  // It converts the canvas drawing to a blob and sends it to the backend.
  const handleDrawEnd = (canvas: HTMLCanvasElement) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      const formData = new FormData();
      formData.append("image", blob, "digit.png");

      try {
        // Make a POST request to the backend's /predict endpoint
        const response = await axios.post("http://localhost:5000/predict", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setPrediction(response.data.digit);
      } catch (error) {
        console.error("Prediction error:", error);
      }
    });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>AI Digit Recognizer</h1>
      <Canvas onDrawEnd={handleDrawEnd} />
      <p style={{ fontSize: "1.5rem" }}>
        Prediction: {prediction !== null ? prediction : "Draw a digit!"}
      </p>
    </div>
  );
};

export default App;
