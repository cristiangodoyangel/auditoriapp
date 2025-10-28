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
    console.log('[DEBUG] Usuario en localStorage:', user);
    isAuditor = user && (user.rol === 'auditor' || user.role === 'auditor');
    console.log('[DEBUG] isAuditor:', isAuditor);
  } catch (err) {
    console.log('[DEBUG] Error al leer usuario de localStorage:', err);
  }

  useEffect(() => {
    const token = localStorage.getItem('access');
    console.log('[DEBUG] Token:', token);
    // Intentar obtener comunidad desde el token guardado
    let comunidadFromToken = null;
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log('[DEBUG] user para comunidadFromToken:', user);
      if (user && user.comunidad && user.comunidad.id) {
        comunidadFromToken = user.comunidad.id;
        console.log('[DEBUG] comunidadFromToken:', comunidadFromToken);
      }
    } catch (err) {
      console.log('[DEBUG] Error al obtener comunidadFromToken:', err);
    }
    async function fetchProyectos() {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/proyectos/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        let data = [];
        const status = res.status;
        const text = await res.text();
        console.log('[DEBUG] Status respuesta proyectos:', status);
        console.log('[DEBUG] Texto respuesta proyectos:', text);
        try {
          data = JSON.parse(text);
        } catch (err) {
          console.log('[DEBUG] Error al parsear proyectos:', err);
          data = [];
        }
        setProyectos(data);
      } catch (err) {
        console.error('[DEBUG] Error al obtener proyectos:', err);
        setProyectos([]);
      }
      setLoading(false);
    }
    async function fetchComunidad() {
      try {
        const res = await fetch('http://localhost:8000/api/auth/profile/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('[DEBUG] fetchComunidad status:', res.status);
        if (res.ok) {
          const data = await res.json();
          console.log('[DEBUG] fetchComunidad data:', data);
          if (data.comunidad_id) {
            setComunidadId(data.comunidad_id);
            console.log('[DEBUG] comunidadId por comunidad_id:', data.comunidad_id);
          } else if (data.comunidad) {
            setComunidadId(data.comunidad);
            console.log('[DEBUG] comunidadId por comunidad:', data.comunidad);
          } else if (comunidadFromToken) {
            setComunidadId(comunidadFromToken);
            console.log('[DEBUG] comunidadId por comunidadFromToken:', comunidadFromToken);
          } else {
            setComunidadId(null);
            console.error('[DEBUG] No se encontró comunidad en el usuario:', data);
          }
        } else {
          if (comunidadFromToken) {
            setComunidadId(comunidadFromToken);
            console.log('[DEBUG] comunidadId por comunidadFromToken (error):', comunidadFromToken);
          } else {
            setComunidadId(null);
            console.error('[DEBUG] Error al obtener usuario:', res.status);
          }
        }
      } catch (err) {
        if (comunidadFromToken) {
          setComunidadId(comunidadFromToken);
          console.log('[DEBUG] comunidadId por comunidadFromToken (catch):', comunidadFromToken);
        } else {
          setComunidadId(null);
          console.error('[DEBUG] Error de red al obtener comunidad:', err);
        }
      }
    }
    async function fetchPeriodoVigente() {
      let user = null;
      try {
        user = JSON.parse(localStorage.getItem('user'));
        console.log('[DEBUG] fetchPeriodoVigente user:', user);
        console.log('[DEBUG] Valor de user.rol:', user ? user.rol : undefined);
        console.log('[DEBUG] Condición admin:', user && user.rol === 'admin' && user.comunidad && user.comunidad.id);
      } catch (err) {
        console.log('[DEBUG] Error al leer user en fetchPeriodoVigente:', err);
      }
      if (user && user.rol === 'admin' && user.comunidad && user.comunidad.id) {
        // Usar endpoint especial para admin de comunidad
        try {
          const res = await fetch('http://localhost:8000/api/auth/inicio-admin-comunidad/', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log('[DEBUG] fetchPeriodoVigente (admin) status:', res.status);
          const text = await res.text();
          console.log('[DEBUG] fetchPeriodoVigente (admin) raw text:', text);
          let data = {};
          try {
            data = JSON.parse(text);
          } catch (err) {
            console.log('[DEBUG] Error parseando JSON periodo admin:', err);
          }
          console.log('[DEBUG] fetchPeriodoVigente (admin) data:', data);
          if (data.periodo && data.periodo.id) {
            setPeriodoVigente(data.periodo);
            console.log('[DEBUG] periodoVigente (admin):', data.periodo);
            return;
          } else {
            console.log('[DEBUG] No se encontró periodo en respuesta admin:', data);
          }
        } catch (err) {
          setPeriodoVigente(null);
          console.log('[DEBUG] Error en fetchPeriodoVigente (admin):', err);
        }
      }
      // Lógica estándar para otros usuarios
      try {
        const res = await fetch('http://localhost:8000/api/periodos/periodos/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('[DEBUG] fetchPeriodoVigente (normal) status:', res.status);
        if (res.ok) {
          const data = await res.json();
          console.log('[DEBUG] fetchPeriodoVigente (normal) data:', data);
          const hoy = new Date().toISOString().slice(0, 10);
          console.log('[DEBUG] Fecha actual (hoy):', hoy);
          console.log('[DEBUG] comunidadId en periodo:', comunidadId);
          const vigente = data.find(p => {
            const comunidadMatch = comunidadId ? String(p.comunidad) === String(comunidadId) : p.comunidad === null;
            console.log('[DEBUG] periodo:', p, 'comunidadMatch:', comunidadMatch);
            return p.fecha_inicio <= hoy && p.fecha_fin >= hoy && comunidadMatch;
          });
          if (vigente) {
            setPeriodoVigente(vigente);
            console.log('[DEBUG] periodoVigente (normal):', vigente);
          } else {
            console.log('[DEBUG] No se encontró periodo vigente');
          }
        }
      } catch (err) {
        setPeriodoVigente(null);
        console.log('[DEBUG] Error en fetchPeriodoVigente (normal):', err);
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
    console.log('[DEBUG] handleCrearProyecto comunidadId:', comunidadId);
    console.log('[DEBUG] handleCrearProyecto periodoVigente:', periodoVigente);
    if (!comunidadId) {
      alert('No se pudo obtener la comunidad del usuario.');
      console.log('[DEBUG] ERROR: comunidadId no disponible');
      return;
    }
    if (!periodoVigente || !periodoVigente.id) {
      alert('No se pudo obtener el periodo vigente.');
      console.log('[DEBUG] ERROR: periodoVigente no disponible', periodoVigente);
      return;
    }
    // Formatear presupuesto_total como string con decimales
    const presupuestoFormateado = Number(nuevoProyecto.presupuesto_total).toFixed(2);
    console.log('[DEBUG] Formulario nuevoProyecto:', nuevoProyecto);
    console.log('[DEBUG] presupuestoFormateado:', presupuestoFormateado);
    const formData = new FormData();
    formData.append('nombre', nuevoProyecto.nombre);
    formData.append('descripcion', nuevoProyecto.descripcion);
    formData.append('periodo', periodoVigente.id);
    formData.append('fecha_inicio', nuevoProyecto.fecha_inicio);
    formData.append('fecha_fin', nuevoProyecto.fecha_fin);
    formData.append('presupuesto_total', presupuestoFormateado);
    formData.append('estado', nuevoProyecto.estado);
    formData.append('estado_rendicion', nuevoProyecto.estado_rendicion);
    formData.append('comunidad', comunidadId);
    formData.append('acta', nuevoProyecto.documentos.asamblea);
    if (nuevoProyecto.documentos.cotizaciones) {
      formData.append('cotizaciones', nuevoProyecto.documentos.cotizaciones);
    }
    if (nuevoProyecto.documentos.elegido) {
      formData.append('elegido', nuevoProyecto.documentos.elegido);
    }
    try {
      const res = await fetch('http://localhost:8000/api/proyectos/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      console.log('[DEBUG] Respuesta crear proyecto status:', res.status);
      const text = await res.text();
      console.log('[DEBUG] Respuesta crear proyecto text:', text);
      if (res.ok) {
        setEtapa(2);
        fetchProyectos();
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
        console.log('[DEBUG] ERROR: No se pudo crear el proyecto');
      }
    } catch (err) {
      alert('Error de red al crear el proyecto');
      console.log('[DEBUG] ERROR: Red al crear proyecto', err);
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
              <thead className="bg-blush">
                <tr>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">Fecha Inicio</th>
                  <th className="px-4 py-2 text-left">Fecha Fin</th>
                  <th className="px-4 py-2 text-left">Presupuesto Total</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-left">Estado Rendición</th>
                  <th className="px-4 py-2 text-left">Falta por Rendir</th>
                  <th className="px-4 py-2 text-left">Documentos</th>
                </tr>
              </thead>
              <tbody>
                {proyectos.map((p, idx) => {
                  // Calcular falta por rendir (ejemplo: presupuesto_total - monto_rendido)
                  const presupuesto = p.presupuesto_total || p.presupuesto || 0;
                  const montoRendido = p.monto_rendido || 0;
                  const faltaPorRendir = Number(presupuesto) - Number(montoRendido);
                  // Documentos: p.acta, p.cotizaciones, p.elegido (pueden ser null o string con url)
                  return (
                    <tr key={p.id}>
                      <td className="px-4 py-2">{p.nombre}</td>
                      <td className="px-4 py-2">{formatFechaCL(p.fecha_inicio)}</td>
                      <td className="px-4 py-2">{formatFechaCL(p.fecha_fin)}</td>
                      <td className="px-4 py-2">${formatMonto(presupuesto)}</td>
                      <td className="px-4 py-2">{p.estado || 'Sin datos'}</td>
                      <td className="px-4 py-2">{p.estado_rendicion || 'Sin datos'}</td>
                      <td className="px-4 py-2">${formatMonto(faltaPorRendir)}</td>
                      <td className="px-4 py-2 space-x-2">
                        {p.acta_url ? (
                          <a href={p.acta_url} target="_blank" rel="noopener noreferrer" className="inline-block bg-indigo text-white px-2 py-1 rounded text-xs font-semibold hover:bg-taupe" download>
                            Acta
                          </a>
                        ) : (
                          <span className="text-xs text-taupe">Sin docs</span>
                        )}
                      </td>
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
