import React, { useEffect, useState, useCallback } from 'react';

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

  useEffect(() => {
    const token = localStorage.getItem('access');
    fetchRendiciones(); 

    fetch('http://localhost:8000/api/proyectos/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setProyectos(Array.isArray(data) ? data : data.results || []))
      .catch(() => setProyectos([]));
  }, [fetchRendiciones]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access');
    
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
    // --- ¡AQUÍ ESTÁ LA CORRECCIÓN PARA EL ERROR 400! ---
    const rendicionPayload = {
      proyecto: form.proyecto,
      monto_rendido: form.monto_rendido,
      descripcion: form.descripcion,
      fecha_rendicion: form.fecha_rendicion,
      
      // El backend espera 'documentos_ids' (plural) y como una LISTA
      documentos_ids: [documentoId]
    };
    // ---------------------------------------------------

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
      <div className="flex justify-end mb-4">
        <button className="bg-indigo text-white px-4 py-2 rounded-lg shadow font-semibold hover:bg-taupe" onClick={() => setShowForm(true)}>
          Crear Rendición
        </button>
      </div>
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
            {/* --- TABLA CORREGIDA --- */}
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
            {/* ----------------------- */}
          </table>
        )}
      </div>
    </div>
  );
}