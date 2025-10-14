import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';

// Importa jQuery y DataTables
import $ from 'jquery';
import 'datatables.net-bs5';

const Comunidades = () => {
  const [comunidades, setComunidades] = useState([]);

  // Fetch comunidades desde API
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/comunidades/')
      .then(response => {
        setComunidades(response.data);
      })
      .catch(error => {
        console.error('Error al obtener las comunidades:', error);
      });
  }, []);

  // Inicializar DataTable cuando hay datos
  useEffect(() => {
    if (comunidades.length > 0) {
      // Destruir instancia previa si ya existe
      if ($.fn.dataTable.isDataTable('#comunidadesTable')) {
        $('#comunidadesTable').DataTable().destroy();
      }
      $('#comunidadesTable').DataTable({
        language: {
          url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
        }
      });
    }
  }, [comunidades]);

  if (comunidades.length === 0) {
    return <div>Cargando comunidades...</div>;
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 text-dark">Comunidades</h1>
          <p className="text-muted">Listado de comunidades beneficiarias registradas.</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="dashboard-card dashboard-card-nohover" style={{ marginTop: '24px' }}>
        <div className="dashboard-card-title">Listado de Comunidades</div>
        <div className="dashboard-card-content2">
          <div className="table-responsive">
            <table id="comunidadesTable" className="table table-striped table-hover align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Región / Comuna</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {comunidades.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.nombre ?? c.name ?? '—'}</td>
                    <td>{c.region ?? c.comuna ?? '—'}</td>
                    <td>
                      <span className={`badge ${c.estado === 'Activo' ? 'bg-success' : 'bg-secondary'}`}>
                        {c.estado ?? 'Desconocido'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comunidades;
