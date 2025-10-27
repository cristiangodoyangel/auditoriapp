import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Proyectos from './pages/Proyectos';
import Socios from './pages/Socios';
import Periodos from './pages/Periodos';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/socios" element={<Socios />} />
          <Route path="/periodos" element={<Periodos />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
