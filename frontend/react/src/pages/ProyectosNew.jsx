import React, { useState, useEffect } from 'react';
import { getProyectos, createProyecto, enviarProyectoRevision, aprobarProyecto } from '../services/apiService';
import { getUser } from '../services/authService';

const ProyectosNew = () => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    presupuesto_asignado: '',
    fecha_inicio: '',
    fecha_fin: ''
  });
  const user = getUser();

  useEffect(() => {
    loadProyectos();
  }, []);

  const loadProyectos = async () => {
    try {
      const data = await getProyectos();
      setProyectos(data.results || data);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProyecto(formData);
      setShowForm(false);
      setFormData({
        nombre: '',
        descripcion: '',
        presupuesto_asignado: '',
        fecha_inicio: '',
        fecha_fin: ''
      });
      loadProyectos();
      alert('Proyecto creado exitosamente');
    } catch (error) {
      alert('Error al crear proyecto');
    }
  };

  const handleEnviarRevision = async (proyectoId) => {
    try {
      await enviarProyectoRevision(proyectoId);
      loadProyectos();
      alert('Proyecto enviado a revisión');
    } catch (error) {
      alert('Error al enviar proyecto a revisión');
    }
  };

  const handleAprobar = async (proyectoId) => {
    const comentarios = prompt('Comentarios de aprobación (opcional):');
    try {
      await aprobarProyecto(proyectoId, comentarios);
      loadProyectos();
      alert('Proyecto aprobado');
    } catch (error) {
      alert('Error al aprobar proyecto');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Borrador':
        return 'bg-yellow-100 text-yellow-800';
      case 'Enviado a Revision':
        return 'bg-orange-100 text-orange-800';
      case 'Aprobado':
        return 'bg-green-100 text-green-800';
      case 'Rechazado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Proyectos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestión de proyectos para {user?.comunidad?.nombre || 'todas las comunidades'}
          </p>
        </div>
        {user?.rol === 'Admin Comunidad' && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Crear Proyecto
            </button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Crear Nuevo Proyecto</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  required
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Presupuesto</label>
                <input
                  type="number"
                  required
                  value={formData.presupuesto_asignado}
                  onChange={(e) => setFormData({...formData, presupuesto_asignado: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
                <input
                  type="date"
                  required
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
                <input
                  type="date"
                  required
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proyectos Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proyecto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Presupuesto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proyectos.map((proyecto) => (
                  <tr key={proyecto.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{proyecto.nombre}</div>
                        <div className="text-sm text-gray-500">{proyecto.descripcion}</div>
                        {proyecto.comunidad_nombre && (
                          <div className="text-xs text-gray-400">{proyecto.comunidad_nombre}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(proyecto.presupuesto_asignado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(proyecto.estado)}`}>
                        {proyecto.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{proyecto.fecha_inicio}</div>
                      <div>{proyecto.fecha_fin}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {proyecto.estado === 'Borrador' && user?.rol === 'Admin Comunidad' && (
                        <button
                          onClick={() => handleEnviarRevision(proyecto.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Enviar a Revisión
                        </button>
                      )}
                      {proyecto.estado === 'Enviado a Revision' && (user?.rol === 'Admin Consejo' || user?.rol === 'Auditor') && (
                        <button
                          onClick={() => handleAprobar(proyecto.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Aprobar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {proyectos.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay proyectos registrados
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProyectosNew;