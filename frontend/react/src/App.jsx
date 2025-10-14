import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { isAuthenticated } from './services/authService';
import Layout from './components/LayoutNew';
import Login from './pages/Login';
import Dashboard from './pages/DashboardModerno';
import Proyectos from './pages/ProyectosNew';
import Socios from './pages/Socios';
import Inicio from './pages/Inicio';
import Resumen from './pages/Resumen';
import Beneficiarios from './pages/Beneficiarios';
import Documentos from './pages/Documentos';
import DocumentReview from './pages/DocumentReview';

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/proyectos" element={<Proyectos />} />
                  <Route path="/socios" element={<Socios />} />
                  <Route path="/inicio" element={<Inicio />} />
                  <Route path="/resumen" element={<Resumen />} />
                  <Route path="/beneficiarios" element={<Beneficiarios />} />
                  <Route path="/documentos" element={<Documentos />} />
                  <Route path="/revision-documentos" element={<DocumentReview />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
