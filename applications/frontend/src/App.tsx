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

export default App
