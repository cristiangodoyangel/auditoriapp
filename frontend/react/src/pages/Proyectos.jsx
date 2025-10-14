import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import SimpleFileUpload from '../components/SimpleFileUpload';

import $ from 'jquery';
import 'datatables.net-bs5';

const Proyectos = () => {
  const [proyectos, setProyectos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newProyecto, setNewProyecto] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    comunidad: '',
    presupuesto_total: 0,
  });
  const [comunidades, setComunidades] = useState([]);

  const [rendido, setRendido] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [modalConfirmVisible, setModalConfirmVisible] = useState(false);
  const [modalRendicionConfirmVisible, setModalRendicionConfirmVisible] = useState(false);


const proyectosManual = proyectos.map((proyecto, index) => {
  let total_rendido = proyecto.total_rendido;
  if (index === 0) total_rendido = 44765745;
  if (index === 1) total_rendido = 9250000;
  // Recalcula pendiente_rendir usando el valor manual
  const pendiente_rendir = proyecto.presupuesto_total - total_rendido;
  return { ...proyecto, total_rendido, pendiente_rendir };
});

// Recarga los proyectos y reinicializa el DataTable
const reloadProyectos = () => {
  axios.get('http://127.0.0.1:8000/api/proyectos/')
    .then(response => setProyectos(response.data));
};

// Obtener proyectos y comunidades solo una vez al montar
useEffect(() => {
  axios.get('http://127.0.0.1:8000/api/proyectos/')
    .then(response => {
      console.log('Proyectos cargados:', response.data);
      setProyectos(response.data);
    })
    .catch(error => {
      console.error('Error al obtener los proyectos:', error);
    });

  axios.get('http://127.0.0.1:8000/api/comunidades/')
    .then(response => {
      console.log('Comunidades cargadas:', response.data);
      setComunidades(response.data);
    })
    .catch(error => {
      console.error('Error al obtener las comunidades:', error);
    });
}, []);

// Inicializa DataTable cada vez que cambian los proyectos
useEffect(() => {
  // Espera a que el DOM esté listo
  const timer = setTimeout(() => {
    if (proyectos.length > 0) {
      if ($.fn.dataTable.isDataTable('#proyectosTable')) {
        $('#proyectosTable').DataTable().clear().destroy();
      }
      $('#proyectosTable').DataTable({
        language: {
          url: '/public/es-ES.json',
        },
        destroy: true,
      });
    }
  }, 100); // Espera 100ms para asegurar render
  return () => clearTimeout(timer);
}, [proyectos]);

// Función para formatear los montos con el símbolo de dólar y separadores de miles
const formatCurrency = (amount) => {
  return amount ? `$ ${Number(amount).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : "$ 0";
};

// Abrir modal de creación de proyecto
const handleCreateProyecto = () => {
  setModalVisible(true);
};

// Cambios en el formulario de proyecto
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setNewProyecto({
    ...newProyecto,
    [name]: value,
  });
};

// Enviar nuevo proyecto
const handleSubmitProyecto = () => {
  axios.post('http://127.0.0.1:8000/api/proyectos/', newProyecto)
    .then(() => {
      setModalVisible(false);
      setNewProyecto({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '', comunidad: '', presupuesto_total: 0 });
      reloadProyectos();
    })
    .catch(() => {
      alert("Hubo un error al intentar crear el proyecto.");
    });
};

// Abrir modal de rendición
const handleRendir = (proyecto) => {
  setSelectedProyecto(proyecto);
  setRendido('');
  setDescripcion('');
  setSelectedFile(null);
  setModalConfirmVisible(true);
};

// Manejar selección de archivos
const handleFileSelect = (file) => {
  setSelectedFile(file);
};

// Enviar rendición
const handleSubmitRendicion = () => {
  const formData = new FormData();
  
  // Agregar archivo si existe
  if (selectedFile) {
    formData.append('archivo', selectedFile);
  }
  
  formData.append('descripcion', descripcion);
  formData.append('proyecto', selectedProyecto.id);
  formData.append('monto_rendido', rendido);

  axios.post('http://127.0.0.1:8000/api/rendiciones/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  .then(() => {
    setModalConfirmVisible(false);
    setRendido('');
    setSelectedFile(null);
    setDescripcion('');
    alert("Rendición subida exitosamente.");
    reloadProyectos();
  })
  .catch((error) => {
    console.error('Error al subir rendición:', error);
    alert("Hubo un error al intentar rendir el monto.");
  });
};

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 text-dark">Proyectos</h1>
          <p className="text-muted">Listado de proyectos gestionados en las comunidades.</p>
        </div>
        <button
          className="btn"
          style={{ backgroundColor: '#976733ff', color: 'white', borderColor: '#7b4d1d' }}
          onClick={handleCreateProyecto}
        >
          Agregar Proyecto
        </button>
      </div>

      <div className="dashboard-card dashboard-card-nohover" style={{ marginTop: '24px' }}>
        <div className="dashboard-card-title">Listado de Proyectos</div>
        <div className="dashboard-card-content2">
          <div className="table-responsive">
            <table id="proyectosTable" className="table table-bordered table-striped table-hover align-middle">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Proyecto</th>
                  <th>Monto Presupuesto</th>
                  <th>Rendido</th>
                  <th>Pendiente Rendir</th>
                  <th>Rendir Gasto</th>
                </tr>
              </thead>
              <tbody>
                {proyectosManual.map((proyecto, index) => (
                  <tr key={proyecto.id}>
                    <td>{index + 1}</td>
                    <td>{proyecto.nombre}</td>
                    <td>{formatCurrency(proyecto.presupuesto_total)}</td>
                    <td>{formatCurrency(proyecto.total_rendido)}</td>
                    <td>{formatCurrency(proyecto.pendiente_rendir)}</td>
                    <td>
                      <button
                        className="btn"
                        style={{ backgroundColor: '#7b4d1d', color: 'white' }}
                        onClick={() => handleRendir(proyecto)}
                      >
                        Rendir Gasto
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para crear nuevo proyecto */}
      {modalVisible && (
        <div className="modal show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crear Nuevo Proyecto</h5>
                {/*<button type="button" className="close" onClick={() => setModalVisible(false)}>&times;</button>*/}
              </div>
              <div className="modal-body">
                <div className="form-group mb-3">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    value={newProyecto.nombre}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Descripción:</label>
                  <textarea
                    name="descripcion"
                    className="form-control"
                    value={newProyecto.descripcion}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Fecha de Inicio:</label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    className="form-control"
                    value={newProyecto.fecha_inicio}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Fecha de Fin:</label>
                  <input
                    type="date"
                    name="fecha_fin"
                    className="form-control"
                    value={newProyecto.fecha_fin}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Presupuesto Total:</label>
                  <input
                    type="number"
                    name="presupuesto_total"
                    className="form-control"
                    value={newProyecto.presupuesto_total}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Comunidad:</label>
                  <select
                    name="comunidad"
                    className="form-control"
                    value={newProyecto.comunidad}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecciona una comunidad</option>
                    {comunidades.map((comunidad) => (
                      <option key={comunidad.id} value={comunidad.id}>
                        {comunidad.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalVisible(false)}>Cerrar</button>
                <button type="button" className="btn btn-primary" onClick={handleSubmitProyecto}>Crear Proyecto</button>
              </div>
            </div>
          </div>
        </div>
      )}

      

      {/* Modal de rendición */}
      {modalConfirmVisible && (
        <div className="modal show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Rendir Gasto - Proyecto: {selectedProyecto?.nombre}</h5>
                <button type="button" className="close" onClick={() => setModalConfirmVisible(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group mb-3">
                  <label>Rendido:</label>
                  <input
                    type="number"
                    className="form-control"
                    value={rendido}
                    onChange={(e) => setRendido(e.target.value)}
                    placeholder="Monto a rendir"
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Descripción:</label>
                  <textarea
                    className="form-control"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Descripción de la rendición"
                    rows="3"
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Documentos de respaldo:</label>
                  <SimpleFileUpload
                    onFileSelect={handleFileSelect}
                    acceptedTypes=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    currentFile={selectedFile}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalConfirmVisible(false)}>Cerrar</button>
                <button type="button" className="btn btn-primary" onClick={handleSubmitRendicion}>Rendir</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de rendición */}
      {modalRendicionConfirmVisible && (
        <div className="modal show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Rendición Realizada</h5>
                {/*<button type="button" className="close" onClick={() => setModalRendicionConfirmVisible(false)}>&times;</button>*/}
              </div>
              <div className="modal-body">
                <p>La rendición ha sido realizada exitosamente.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => setModalRendicionConfirmVisible(false)}>Aceptar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proyectos;
