// src/App.tsx
<<<<<<< Updated upstream
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

=======
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import ClientInference from './ClientInference';
import ServerInference from './ServerInference';
import GradCAMVisualization from './GradCAMVisualization';

const App: React.FC = () => {
  return (
    <Router>
      <nav style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/server-inference" style={{ marginRight: '1rem' }}>Server-Side Inference</Link>
        <Link to="/client-inference" style={{ marginRight: '1rem' }}>Client-Side Inference</Link>
        <Link to="/gradcam">Grad-CAM</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/server-inference" element={<ServerInference />} />
        <Route path="/client-inference" element={<ClientInference />} />
        <Route path="/gradcam" element={<GradCAMVisualization targetLayer="conv2d_Conv2D1" />} />
      </Routes>
    </Router>
  );
};

>>>>>>> Stashed changes
export default App;
