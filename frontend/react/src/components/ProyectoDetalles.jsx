import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Eye, Download } from 'lucide-react';
import DocumentViewer from './DocumentViewer';
import DocumentManager from './DocumentManager';
import '../index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';

// Importa jQuery y DataTables JS
import $ from 'jquery';
import 'datatables.net-bs5';

const ProyectoDetalles = () => {
  const { id } = useParams(); // Obtener el id del proyecto de la URL
  const [proyecto, setProyecto] = useState(null);
  const [rendiciones, setRendiciones] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    // Obtener los detalles del proyecto y sus rendiciones
    axios.get(`http://127.0.0.1:8000/api/proyectos/${id}/`)
      .then(response => {
        setProyecto(response.data);
      })
      .catch(error => {
        console.error('Error al obtener el proyecto:', error);
      });

    axios.get(`http://127.0.0.1:8000/api/rendiciones/?proyecto=${id}`)
      .then(response => {
        setRendiciones(response.data);
      })
      .catch(error => {
        console.error('Error al obtener las rendiciones:', error);
      });
  }, [id]);

  useEffect(() => {
    // Inicializa DataTable solo cuando hay datos
    if (rendiciones.length > 0) {
      if ($.fn.dataTable.isDataTable('#rendicionesTable')) {
        $('#rendicionesTable').DataTable().destroy();
      }

      $('#rendicionesTable').DataTable({
        language: {
          url: '/public/es-ES.json'  // Ruta local a tu archivo es-ES.json
        }
      });
    }
  }, [rendiciones]);

  const handleViewDocument = (rendicion) => {
    const document = {
      id: rendicion.id,
      name: rendicion.archivo.split('/').pop(),
      url: rendicion.archivo,
      type: rendicion.archivo.includes('.pdf') ? 'application/pdf' : 'image/jpeg',
      size: 0 // We don't have size info, so default to 0
    };
    setSelectedDocument(document);
    setShowViewer(true);
  };

  if (!proyecto) {
    return <div>Cargando detalles del proyecto...</div>;
  }

  return (
    <div className="d-flex" style={{ height: '100vh' }}>
      {/* Barra lateral */}
      <div className="sidebar bg-dark text-white p-3" style={{ width: '250px' }}>
        <h3>GDP</h3>
        <ul className="list-unstyled">
          <li><a href="/proyectos" className="text-white">Proyectos</a></li>
          <li><a href="/comunidades" className="text-white">Comunidades</a></li>
          <li><a href="/finanzas" className="text-white">Finanzas</a></li>
          <li><a href="/reportes" className="text-white">Reportes</a></li>
        </ul>
      </div>

      {/* Contenedor Principal */}
      <div className="container-fluid py-4" style={{ marginLeft: '250px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 text-dark">Detalles del Proyecto: {proyecto.nombre}</h1>
        </div>

        <p className="text-muted">{proyecto.descripcion}</p>

        {/* Sección de Rendiciones */}
        <div className="dashboard-card dashboard-card-nohover" style={{ marginTop: '24px' }}>
          <div className="dashboard-card-title">Rendiciones del Proyecto</div>
          <div className="dashboard-card-content2">
            <div className="table-responsive">
              <table id="rendicionesTable" className="table table-bordered table-striped table-hover align-middle">
                <thead>
                  <tr>
                    <th style={{ width: '5%' }}>Nº</th>
                    <th>Monto Rendido</th>
                    <th>Descripción</th>
                    <th>Documento</th>
                  </tr>
                </thead>
                <tbody>
                  {rendiciones.map((rendicion, index) => (
                    <tr key={rendicion.id}>
                      <td>{index + 1}</td>
                      <td>{Number(rendicion.monto_rendido).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                      <td>{rendicion.descripcion}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDocument(rendicion)}
                            title="Ver documento"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={rendicion.archivo}
                            className="btn btn-sm btn-outline-secondary"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Descargar"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Document Management Section */}
        <div className="mt-4">
          <DocumentManager 
            projectId={id} 
            showProjectFilter={false}
          />
        </div>
      </div>

      {/* Document Viewer */}
      {showViewer && selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setShowViewer(false)}
          showActions={false}
        />
      )}
    </div>
  );
};

export default ProyectoDetalles;
