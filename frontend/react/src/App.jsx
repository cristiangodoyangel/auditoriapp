import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout'; // Asegúrate de que la ruta sea correcta
import Inicio from './pages/Inicio'; // Asegúrate de que la ruta sea correcta
import Proyectos from './pages/Proyectos'; // Asegúrate de que la ruta sea correcta
import Resumen from './pages/Resumen';
import Beneficiarios from './pages/Beneficiarios';
import Documentos from './pages/Documentos';
import DocumentReview from './pages/DocumentReview';


const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/resumen" element={<Resumen />} />
          <Route path="/beneficiarios" element={<Beneficiarios />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/revision-documentos" element={<DocumentReview />} />
          {/* Agregar más rutas si es necesario */}
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
