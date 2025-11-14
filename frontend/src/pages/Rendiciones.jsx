import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- 1. FALTABA IMPORTAR useNavigate

// --- (Funciones de ayuda para formato) ---
function formatFechaCL(fecha) {
  if (!fecha || typeof fecha !== 'string' || !fecha.includes('-')) return '';
  const parts = fecha.split('T')[0].split('-');
  if (parts.length !== 3) return fecha;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function formatMonto(monto) {
  if (monto === undefined || monto === null || isNaN(monto)) return 'Sin datos';
  return Number(monto).toLocaleString('es-CL', { maximumFractionDigits: 0 });
}
// ------------------------------------------

export default function Rendiciones() {
  const [rendiciones, setRendiciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    proyecto: '',
    documento: null,
    monto_rendido: '',
    descripcion: '',
    fecha_rendicion: '',
  });
  const [proyectos, setProyectos] = useState([]);

  // --- 2. FALTABAN ESTOS ESTADOS Y EL HOOK ---
  const [comunidadId, setComunidadId] = useState(null);
  const [periodoVigente, setPeriodoVigente] = useState(null);
  const [showNoPeriodoModal, setShowNoPeriodoModal] = useState(false);
  const navigate = useNavigate();
  // -----------------------------------------

  const fetchRendiciones = useCallback(async () => {
    const token = localStorage.getItem('access');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/rendiciones/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = res.ok ? await res.json() : [];
      setRendiciones(Array.isArray(data) ? data : data.results || []);
    } catch {
      setRendiciones([]);
    }
    setLoading(false);
  }, [setLoading, setRendiciones]);
  
  // --- 3. FALTABA TODA LA LÓGICA EN useEffect ---
  useEffect(() => {
    const token = localStorage.getItem('access');

    // (Necesitamos esta función de Proyectos.jsx)
    async function fetchComunidad() {
      let comunidadFromToken = null;
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.comunidad && user.comunidad.id) {
          comunidadFromToken = user.comunidad.id;
        }
      } catch (err) { /* Silencio */ }

      try {
        const res = await fetch("http://localhost:8000/api/auth/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          let id = null;
          if (data.comunidad_id) id = data.comunidad_id;
          else if (data.comunidad) id = data.comunidad;
          else if (comunidadFromToken) id = comunidadFromToken;
          if (id) {
            setComunidadId(id);
            return id;
          }
        }
        // Fallback
        if (comunidadFromToken) {
            setComunidadId(comunidadFromToken);
            return comunidadFromToken;
        }
        return null;
      } catch (err) {
        if (comunidadFromToken) {
            setComunidadId(comunidadFromToken);
            return comunidadFromToken;
        }
        return null;
      }
    }
    
    // (Necesitamos esta función de Proyectos.jsx)
    async function fetchPeriodoVigente(idComunidad) {
      if (!idComunidad) {
        setPeriodoVigente(null);
        return;
      }

      try {
        const res = await fetch(
          "http://localhost:8000/api/periodos/periodos/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const data = await res.json();
          const listaPeriodos = Array.isArray(data) ? data : data.results || [];
          const hoy = new Date().toISOString().slice(0, 10);

          const vigente = listaPeriodos.find((p) => {
            const esDeMiComunidad = String(p.comunidad) === String(idComunidad);
            const fechaValida = p.fecha_inicio <= hoy && p.fecha_fin >= hoy;
            return esDeMiComunidad && fechaValida;
          });

          if (vigente) {
            setPeriodoVigente(vigente);
          } else {
            setPeriodoVigente(null);
            setShowNoPeriodoModal(true); // ¡MOSTRAR MODAL!
          }
        } else {
          console.error("Error al obtener periodos:", res.status);
        }
      } catch (err) {
        console.error("Error de red en fetchPeriodoVigente:", err);
        setPeriodoVigente(null);
      }
    }
    
    // (Función que ya tenías para el <select>)
    async function fetchProyectos() {
        fetch('http://localhost:8000/api/proyectos/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.ok ? res.json() : [])
        .then(data => setProyectos(Array.isArray(data) ? data : data.results || []))
        .catch(() => setProyectos([]));
    }
    
    // El Orquestador
    async function cargarDatosIniciales() {
      const idComunidad = await fetchComunidad();
      await fetchPeriodoVigente(idComunidad); // <-- Chequeo de periodo
      await fetchRendiciones(); // Carga la tabla de rendiciones
      await fetchProyectos(); // Carga los proyectos para el dropdown
    }

    cargarDatosIniciales();
  }, [fetchRendiciones]);
  // ------------------------------------------

  // --- 4. FALTABA ESTE MANEJADOR ---
  // Este manejador comprueba el periodo ANTES de mostrar el formulario
  const handleShowForm = () => {
    if (!periodoVigente) {
      setShowNoPeriodoModal(true); // Si no hay periodo, muestra el modal
    } else {
      setShowForm(true); // Si hay periodo, muestra el formulario
    }
  };
  // ---------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access');
    
    // (Doble chequeo por si acaso)
    if (!periodoVigente) {
        setShowNoPeriodoModal(true);
        return;
    }

    // 1. Subir el documento PDF
    const docForm = new FormData();
    docForm.append('archivo', form.documento);
    docForm.append('nombre', form.documento.name);
    docForm.append('tipo', 'rendicion');
    docForm.append('descripcion', form.descripcion);

    let docData;
    try {
      const docRes = await fetch('http://localhost:8000/api/documentos/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: docForm
      });
      docData = await docRes.json();
      if (!docRes.ok) {
        throw new Error('Error al subir el documento: ' + JSON.stringify(docData));
      }
    } catch (err) {
      alert(err.message);
      return;
    }
    
    const documentoId = docData.id;

    // 2. Crear la rendición
    const rendicionPayload = {
      proyecto: form.proyecto,
      monto_rendido: form.monto_rendido,
      descripcion: form.descripcion,
      fecha_rendicion: form.fecha_rendicion,
      documentos_ids: [documentoId]
    };

    try {
      const res = await fetch('http://localhost:8000/api/rendiciones/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rendicionPayload)
      });
      
      const resText = await res.text();
      if (!res.ok) {
        try {
            const errJson = JSON.parse(resText);
            alert('Error al guardar la rendición: ' + JSON.stringify(errJson));
        } catch {
            alert('Error al guardar la rendición: ' + resText);
        }
        return; 
      }

      fetchRendiciones(); 
      setShowForm(false);
      setForm({ proyecto: '', documento: null, monto_rendido: '', descripcion: '', fecha_rendicion: '' });

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* (Tu JSX del modal está perfecto, solo actualicé el 'onClick') */}
      {showNoPeriodoModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4 text-indigo">Atención</h2>
            <p className="text-taupe mb-6">
              No se encontró un Periodo activo para su comunidad.
              <br />
              Debe crear un periodo antes de poder gestionar proyectos.
            </p>
            <button
              className="bg-indigo text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-taupe"
              onClick={() => navigate("/crear-periodo")} // Redirige a la página de crear-periodo
            >
              Crear Periodo
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end mb-4">
        {/* --- 5. FALTABA ACTUALIZAR EL onClick --- */}
        <button 
          className="bg-indigo text-white px-4 py-2 rounded-lg shadow font-semibold hover:bg-taupe" 
          onClick={handleShowForm} // Cambiado de 'setShowForm(true)'
        >
          Crear Rendición
        </button>
        {/* ------------------------------------- */}
      </div>

      {/* (El resto de tu código de formulario y tabla está bien) */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-taupe text-xl" onClick={() => setShowForm(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4 text-deep-purple">Nueva Rendición</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-taupe mb-1">Proyecto</label>
                <select className="w-full border rounded px-3 py-2" required value={form.proyecto} onChange={e => setForm(f => ({ ...f, proyecto: e.target.value }))}>
                  <option value="">Selecciona un proyecto</option>
                  {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-taupe mb-1">Documento PDF (Factura/Boleta)</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={e => setForm(f => ({ ...f, documento: e.target.files[0] }))}
                />
                {form.documento && (
                  <div className="mt-2 text-sm text-taupe">Archivo seleccionado: {form.documento.name}</div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-taupe mb-1">Monto Rendido</label>
                <input className="w-full border rounded px-3 py-2" type="number" required value={form.monto_rendido} onChange={e => setForm(f => ({ ...f, monto_rendido: e.target.value }))} />
              </div>
              <div className="mb-4">
                <label className="block text-taupe mb-1">Descripción</label>
                <textarea className="w-full border rounded px-3 py-2" required value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
              </div>
              <div className="mb-4">
                <label className="block text-taupe mb-1">Fecha de Rendición</label>
                <input className="w-full border rounded px-3 py-2" type="date" required value={form.fecha_rendicion} onChange={e => setForm(f => ({ ...f, fecha_rendicion: e.target.value }))} />
              </div>
              <button className="bg-indigo text-white px-4 py-2 rounded-lg shadow font-semibold hover:bg-taupe" type="submit">Guardar</button>
            </form>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-deep-purple mb-4">Rendiciones Realizadas</h2>
        {loading ? (
          <div className="text-center text-taupe">Cargando...</div>
        ) : rendiciones.length === 0 ? (
          <div className="text-center text-taupe">No hay rendiciones registradas.</div>
        ) : (
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-background">
                <th className="px-4 py-2 text-left text-taupe">Proyecto</th>
                <th className="px-4 py-2 text-left text-taupe">Descripción</th>
                <th className="px-4 py-2 text-left text-taupe">Monto Rendido</th>
                <th className="px-4 py-2 text-left text-taupe">Fecha</th>
                <th className="px-4 py-2 text-left text-taupe">Documentos</th>
              </tr>
            </thead>
            <tbody>
                {rendiciones.map(r => (
                  <tr key={r.id} className="border-b">
                    <td className="px-4 py-2">{r.proyecto_nombre || '...'}</td>
                    <td className="px-4 py-2">{r.descripcion}</td>
                    <td className="px-4 py-2">${formatMonto(r.monto_rendido)}</td>
                    <td className="px-4 py-2">{formatFechaCL(r.fecha_rendicion)}</td>
                    <td className="px-4 py-2 text-center">
                    {r.documentos_adjuntos && r.documentos_adjuntos.length > 0 ? (
                        r.documentos_adjuntos.map(doc => (
                            <a 
                              key={doc.id}
                              href={doc.archivo} 
                              download 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              title={doc.nombre}
                              className="inline-block bg-indigo text-white px-3 py-1 rounded shadow hover:bg-taupe transition mb-1 text-xs"
                            >
                              Ver PDF
                            </a>
                        ))
                    ) : (
                        <span>-</span>
                    )}
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}