import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Proyectos from './pages/Proyectos';
import Socios from './pages/Socios';
import Periodos from './pages/Periodos';
import Rendiciones from './pages/Rendiciones';
import Login from './pages/Login';
import CrearPeriodo from './pages/CrearPeriodo';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access'));
  const [redirectTo, setRedirectTo] = useState(null);

  function Redirector() {
    const navigate = useNavigate();
    React.useEffect(() => {
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      }
    }, [redirectTo, navigate]);
    return null;
  }

  const handleLogin = () => {
    setIsAuthenticated(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.rol && (user.rol.toLowerCase().includes('admin'))) {
      setRedirectTo('/crear-periodo');
    } else {
      setRedirectTo('/dashboard');
    }
  };

  const handlePeriodoCreado = () => {
    setRedirectTo('/dashboard');
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Redirector />
      <Layout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crear-periodo" element={<CrearPeriodo onPeriodoCreado={handlePeriodoCreado} />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/socios" element={<Socios />} />
          <Route path="/periodos" element={<Periodos />} />
          <Route path="/rendiciones" element={<Rendiciones />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
