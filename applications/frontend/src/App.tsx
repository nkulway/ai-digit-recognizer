// src/App.tsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ServerInference from './ServerInference'
import ClientInference from './ClientInference'
import Home from './Home'

const App: React.FC = () => {
  return (
    <Router>
      <nav style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>
          Home
        </Link>
        <Link to="/server-inference" style={{ marginRight: '1rem' }}>
          Server-Side Inference
        </Link>
        <Link to="/client-inference">Client-Side Inference</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/server-inference" element={<ServerInference />} />
        <Route path="/client-inference" element={<ClientInference />} />
      </Routes>
    </Router>
  )
}

export default App
