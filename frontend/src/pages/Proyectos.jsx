import React, { useEffect, useState } from 'react';

function formatMonto(monto) {
  if (monto === undefined || monto === null || isNaN(monto)) return 'Sin datos';
  return Number(monto).toLocaleString('es-CL', { maximumFractionDigits: 0 });
}

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [etapa, setEtapa] = useState(0); // 0: nada, 1: crear, 2: auditor, 3: resumen
  const [nuevoProyecto, setNuevoProyecto] = useState({
    nombre: '',
    descripcion: '',
    periodo: '',
    fecha_inicio: '',
    fecha_fin: '',
    presupuesto_total: '',
    estado: 'Borrador',
    estado_rendicion: 'Pendiente',
    documentos: { asamblea: null, cotizaciones: null, elegido: null }
  });
  const [comunidadId, setComunidadId] = useState(null);
  const [periodoVigente, setPeriodoVigente] = useState(null);
  // Detectar si el usuario es auditor
  let isAuditor = false;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    isAuditor = user && (user.rol === 'auditor' || user.role === 'auditor');
  } catch {}

  useEffect(() => {
    const token = localStorage.getItem('access');
    // Intentar obtener comunidad desde el token guardado
    let comunidadFromToken = null;
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.comunidad && user.comunidad.id) {
        comunidadFromToken = user.comunidad.id;
      }
    } catch {}
    async function fetchProyectos() {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/proyectos/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        let data = [];
        const status = res.status;
        const text = await res.text();
        console.log('Status respuesta proyectos:', status);
        console.log('Texto respuesta proyectos:', text);
        try {
          data = JSON.parse(text);
        } catch {
          data = [];
        }
        setProyectos(data);
      } catch (err) {
        console.error('Error al obtener proyectos:', err);
        setProyectos([]);
      }
      setLoading(false);
    }
    async function fetchComunidad() {
      try {
        const res = await fetch('http://localhost:8000/api/auth/profile/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.comunidad_id) {
            setComunidadId(data.comunidad_id);
          } else if (data.comunidad) {
            setComunidadId(data.comunidad);
          } else if (comunidadFromToken) {
            setComunidadId(comunidadFromToken);
          } else {
            setComunidadId(null);
            console.error('No se encontró comunidad en el usuario:', data);
          }
        } else {
          if (comunidadFromToken) {
            setComunidadId(comunidadFromToken);
          } else {
            setComunidadId(null);
            console.error('Error al obtener usuario:', res.status);
          }
        }
      } catch (err) {
        if (comunidadFromToken) {
          setComunidadId(comunidadFromToken);
        } else {
          setComunidadId(null);
          console.error('Error de red al obtener comunidad:', err);
        }
      }
    }
    async function fetchPeriodoVigente() {
      try {
        const res = await fetch('http://localhost:8000/api/periodos/periodos/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Buscar periodo vigente por fechas y comunidad
          const hoy = new Date().toISOString().slice(0, 10);
          const vigente = data.find(p => {
            // comunidad puede ser null, string o número
            const comunidadMatch = comunidadId ? String(p.comunidad) === String(comunidadId) : p.comunidad === null;
            return p.fecha_inicio <= hoy && p.fecha_fin >= hoy && comunidadMatch;
          });
          if (vigente) setPeriodoVigente(vigente);
        }
      } catch (err) {
        setPeriodoVigente(null);
      }
    }
    fetchProyectos();
    fetchComunidad();
    fetchPeriodoVigente();
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
    // Asignar periodo artificialmente con valor 2
    const formData = new FormData();
    formData.append('nombre', nuevoProyecto.nombre);
    formData.append('descripcion', nuevoProyecto.descripcion);
    formData.append('periodo', 2);
    formData.append('fecha_inicio', nuevoProyecto.fecha_inicio);
    formData.append('fecha_fin', nuevoProyecto.fecha_fin);
    formData.append('presupuesto_total', nuevoProyecto.presupuesto_total);
    formData.append('estado', nuevoProyecto.estado);
    formData.append('estado_rendicion', nuevoProyecto.estado_rendicion);
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
        // Recargar proyectos desde el backend
        fetchProyectos();
        // Limpiar formulario
        setNuevoProyecto({
          nombre: '',
          descripcion: '',
          periodo: '',
          fecha_inicio: '',
          fecha_fin: '',
          presupuesto_total: '',
          estado: 'Borrador',
          estado_rendicion: 'Pendiente',
          documentos: { asamblea: null, cotizaciones: null, elegido: null }
        });
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
            <label className="block text-taupe mb-1">Descripción</label>
            <textarea name="descripcion" value={nuevoProyecto.descripcion} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          {/* Campo periodo eliminado, se asigna automáticamente */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-taupe mb-1">Fecha Inicio</label>
              <input type="date" name="fecha_inicio" value={nuevoProyecto.fecha_inicio} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-taupe mb-1">Fecha Fin</label>
              <input type="date" name="fecha_fin" value={nuevoProyecto.fecha_fin} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2" required />
            </div>
          </div>
          <div>
            <label className="block text-taupe mb-1">Presupuesto Total</label>
            <input type="number" name="presupuesto_total" value={nuevoProyecto.presupuesto_total} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label htmlFor="asamblea" className="block text-taupe mb-1">Acta de Asamblea</label>
              <label htmlFor="asamblea" className="w-full block">
                <span className="boton-subir-acta inline-block bg-taupe text-white rounded-lg px-4 py-2 font-semibold shadow cursor-pointer text-center w-full hover:bg-blush">Subir Acta</span>
                <input type="file" id="asamblea" name="asamblea" onChange={handleFileChange} className="hidden" required />
              </label>
              {nuevoProyecto.documentos.asamblea && (
                <div className="text-xs text-taupe mt-1 truncate">{nuevoProyecto.documentos.asamblea.name}</div>
              )}
            </div>
            <div>
              <label htmlFor="cotizaciones" className="block text-taupe mb-1">Cotizaciones</label>
              <label htmlFor="cotizaciones" className="w-full block">
                <span className="inline-block bg-taupe text-white rounded-lg px-4 py-2 font-semibold shadow cursor-pointer text-center w-full">Subir Cotización</span>
                <input type="file" id="cotizaciones" name="cotizaciones" onChange={handleFileChange} className="hidden" required />
              </label>
              {nuevoProyecto.documentos.cotizaciones && (
                <div className="text-xs text-taupe mt-1 truncate">{nuevoProyecto.documentos.cotizaciones.name}</div>
              )}
            </div>
            <div>
              <label htmlFor="elegido" className="block text-taupe mb-1">Elegido</label>
              <label htmlFor="elegido" className="w-full block">
                <span className="inline-block bg-taupe text-white rounded-lg px-4 py-2 font-semibold shadow cursor-pointer text-center w-full">Subir Elegido</span>
                <input type="file" id="elegido" name="elegido" onChange={handleFileChange} className="hidden" required />
              </label>
              {nuevoProyecto.documentos.elegido && (
                <div className="text-xs text-taupe mt-1 truncate">{nuevoProyecto.documentos.elegido.name}</div>
              )}
            </div>
          </div>
          <button type="submit" className="bg-indigo text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-taupe">Crear Proyecto</button>
        </form>
      )}
      {/* Etapa 2: Revisión auditor solo para auditores */}
      {etapa === 2 && isAuditor && (
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
                  <th className="px-4 py-2 text-left">Presupuesto Total</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-left">Estado Rendición</th>
                  <th className="px-4 py-2 text-left">Falta por Rendir</th>
                </tr>
              </thead>
              <tbody>
                {proyectos.map((p, idx) => {
                  // Calcular falta por rendir (ejemplo: presupuesto_total - monto_rendido)
                  const presupuesto = p.presupuesto_total || p.presupuesto || 0;
                  const montoRendido = p.monto_rendido || 0;
                  const faltaPorRendir = Number(presupuesto) - Number(montoRendido);
                  return (
                    <tr key={p.id}>
                      <td className="px-4 py-2">{p.nombre}</td>
                      <td className="px-4 py-2">${formatMonto(presupuesto)}</td>
                      <td className="px-4 py-2">{p.estado || 'Sin datos'}</td>
                      <td className="px-4 py-2">{p.estado_rendicion || 'Sin datos'}</td>
                      <td className="px-4 py-2">${formatMonto(faltaPorRendir)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
