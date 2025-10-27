import React, { useEffect, useState } from 'react';

function formatMonto(monto) {
  if (monto === undefined || monto === null || isNaN(monto)) return 'Sin datos';
  return Number(monto).toLocaleString('es-CL', { maximumFractionDigits: 0 });
}

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [etapa, setEtapa] = useState(0); // 0: nada, 1: crear, 2: auditor, 3: resumen
  const [nuevoProyecto, setNuevoProyecto] = useState({ nombre: '', presupuesto: '', documentos: { asamblea: null, cotizaciones: null, elegido: null } });
  const [comunidadId, setComunidadId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access');
    async function fetchProyectos() {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/proyectos/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.ok ? await res.json() : [];
        setProyectos(data);
      } catch {
        setProyectos([]);
      }
      setLoading(false);
    }
    // Obtener comunidad del usuario logueado
    async function fetchComunidad() {
      try {
        const res = await fetch('http://localhost:8000/api/usuarios/me/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setComunidadId(data.comunidad_id || null);
        }
      } catch {
        setComunidadId(null);
      }
    }
    fetchProyectos();
    fetchComunidad();
  }, []);

  // Etapa 1: Crear proyecto y cargar documentos
  const handleInputChange = e => {
    setNuevoProyecto({ ...nuevoProyecto, [e.target.name]: e.target.value });
  };
  const handleFileChange = e => {
    setNuevoProyecto({
      ...nuevoProyecto,
      documentos: { ...nuevoProyecto.documentos, [e.target.name]: e.target.files[0] }
    });
  };
  const handleCrearProyecto = async e => {
    e.preventDefault();
    const token = localStorage.getItem('access');
    if (!comunidadId) {
      alert('No se pudo obtener la comunidad del usuario.');
      return;
    }
    const formData = new FormData();
    formData.append('nombre', nuevoProyecto.nombre);
    formData.append('presupuesto', nuevoProyecto.presupuesto);
    formData.append('comunidad', comunidadId);
    // Acta (asamblea) como campo único
    formData.append('acta', nuevoProyecto.documentos.asamblea);
    // Los demás documentos como array
    if (nuevoProyecto.documentos.cotizaciones) {
      formData.append('documentos[]', nuevoProyecto.documentos.cotizaciones);
    }
    if (nuevoProyecto.documentos.elegido) {
      formData.append('documentos[]', nuevoProyecto.documentos.elegido);
    }
    try {
      const res = await fetch('http://localhost:8000/api/proyectos/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setEtapa(2);
        // Opcional: recargar proyectos
        const data = await res.json();
        setProyectos(prev => [...prev, data]);
      } else {
        alert('Error al crear el proyecto');
      }
    } catch {
      alert('Error de red al crear el proyecto');
    }
  };

  // Etapa 2: Revisión auditor
  const handleAprobarProyecto = () => {
    // Aquí iría la lógica para aprobar el proyecto en el backend
    setEtapa(3);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end mb-4">
        <button className="bg-indigo text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-taupe" onClick={() => setEtapa(1)}>
          Crear Proyecto
        </button>
      </div>
      <h2 className="text-2xl font-bold text-deep-purple">Gestión de Proyectos</h2>
      <p className="text-taupe">Creación, seguimiento y rendición de proyectos comunitarios</p>
      <div className="flex justify-end mb-4">
       
      </div>
      {/* Etapa 1: Crear proyecto */}
      {etapa === 1 && (
        <form className="bg-white rounded-lg shadow p-6 border border-gray-200 max-w-xl mx-auto space-y-4" onSubmit={handleCrearProyecto}>
          <h3 className="text-lg font-bold text-indigo mb-2">Etapa 1: Creación de Proyecto</h3>
          <div>
            <label className="block text-taupe mb-1">Nombre del Proyecto</label>
            <input type="text" name="nombre" value={nuevoProyecto.nombre} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-taupe mb-1">Presupuesto</label>
            <input type="number" name="presupuesto" value={nuevoProyecto.presupuesto} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-taupe mb-1">Acta de Asamblea</label>
              <input type="file" name="asamblea" onChange={handleFileChange} className="w-full file:bg-indigo file:text-white file:rounded-lg file:px-4 file:py-2 file:font-semibold file:shadow file:border-none file:cursor-pointer" required />
            </div>
            <div>
              <label className="block text-taupe mb-1">Cotizaciones</label>
              <input type="file" name="cotizaciones" onChange={handleFileChange} className="w-full file:bg-taupe file:text-white file:rounded-lg file:px-4 file:py-2 file:font-semibold file:shadow file:border-none file:cursor-pointer" required />
            </div>
            <div>
              <label className="block text-taupe mb-1">Elegido</label>
              <input type="file" name="elegido" onChange={handleFileChange} className="w-full file:bg-taupe file:text-white file:rounded-lg file:px-4 file:py-2 file:font-semibold file:shadow file:border-none file:cursor-pointer" required />
            </div>
          </div>
          <button type="submit" className="bg-indigo text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-taupe">Crear Proyecto</button>
        </form>
      )}
      {/* Etapa 2: Revisión auditor */}
      {etapa === 2 && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200 max-w-xl mx-auto space-y-4">
          <h3 className="text-lg font-bold text-indigo mb-2">Etapa 2: Revisión por Auditor</h3>
          <p className="text-taupe">Un auditor debe revisar la documentación cargada y aprobar el proyecto para avanzar.</p>
          <button className="bg-indigo text-white px-4 py-2 rounded-lg font-semibold" onClick={handleAprobarProyecto}>Aprobar Proyecto</button>
        </div>
      )}
      {/* Etapa 3: Resumen general */}
      {etapa === 3 && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200 max-w-xl mx-auto space-y-4">
          <h3 className="text-lg font-bold text-indigo mb-2">Etapa 3: Resumen General</h3>
          <div className="mb-2"><span className="font-semibold text-taupe">Nombre:</span> {nuevoProyecto.nombre}</div>
          <div className="mb-2"><span className="font-semibold text-taupe">Presupuesto:</span> ${formatMonto(nuevoProyecto.presupuesto)}</div>
          <div className="mb-2"><span className="font-semibold text-taupe">Respaldo de Asamblea:</span> {nuevoProyecto.documentos.asamblea ? nuevoProyecto.documentos.asamblea.name : 'Sin archivo'}</div>
          <div className="mb-2"><span className="font-semibold text-taupe">Cotizaciones:</span> {nuevoProyecto.documentos.cotizaciones ? nuevoProyecto.documentos.cotizaciones.name : 'Sin archivo'}</div>
          <div className="mb-2"><span className="font-semibold text-taupe">Elegido:</span> {nuevoProyecto.documentos.elegido ? nuevoProyecto.documentos.elegido.name : 'Sin archivo'}</div>
          <div className="mt-4 text-green-600 font-bold">Proyecto aprobado y listo para ejecución.</div>
        </div>
      )}
      {/* Listado de proyectos existentes */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-deep-purple mb-2">Proyectos existentes</h3>
        {loading ? (
          <div className="text-center text-taupe">Cargando...</div>
        ) : proyectos.length === 0 ? (
          <div className="text-center text-taupe">Sin datos aún</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">Presupuesto</th>
                  <th className="px-4 py-2 text-left">Comunidad</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                </tr>
              <