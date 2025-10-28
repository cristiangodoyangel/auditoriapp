import React, { useEffect, useState } from 'react';

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

  useEffect(() => {
    const token = localStorage.getItem('access');
    setLoading(true);
    fetch('http://localhost:8000/api/rendiciones/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setRendiciones(Array.isArray(data) ? data : data.results || []);
        setLoading(false);
      })
      .catch(() => {
        setRendiciones([]);
        setLoading(false);
      });
    // Obtener proyectos para el select
    fetch('http://localhost:8000/api/proyectos/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setProyectos(data))
      .catch(() => setProyectos([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access');
    // 1. Subir el documento PDF
    const docForm = new FormData();
    docForm.append('archivo', form.documento);
    docForm.append('nombre', form.documento.name);
    docForm.append('tipo', 'pdf');
    docForm.append('descripcion', form.descripcion);

    console.log('--- DOCUMENTO ---');
    console.log('URL:', 'http://localhost:8000/api/documentos/');
    console.log('Método:', 'POST');
    console.log('Headers:', { 'Authorization': `Bearer ${token}` });
    console.log('Body:', docForm);
    const docRes = await fetch('http://localhost:8000/api/documentos/', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: docForm
    });
    console.log('Respuesta documento:', docRes);
    let docData = {};
    let docText = '';
    try {
      docText = await docRes.text();
      docData = JSON.parse(docText);
    } catch (e) {
      console.log('Error parseando respuesta documento:', e);
      console.log('Texto recibido:', docText);
    }
    console.log('Datos documento:', docData);
    const documentoId = docData.id;

    // 2. Crear la rendición
    const rendicionPayload = {
      proyecto: form.proyecto,
      documento: documentoId,
      monto_rendido: form.monto_rendido,
      descripcion: form.descripcion,
      fecha_rendicion: form.fecha_rendicion
    };

    console.log('--- RENDICIÓN ---');
    console.log('URL:', 'http://localhost:8000/api/rendiciones/');
    console.log('Método:', 'POST');
    console.log('Headers:', {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    console.log('Body:', rendicionPayload);
    const res = await fetch('http://localhost:8000/api/rendiciones/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rendicionPayload)
    });
    console.log('Respuesta rendición:', res);
    let error = {};
    let errorText = '';
    if (!res.ok) {
      try {
        errorText = await res.text();
        error = JSON.parse(errorText);
      } catch (e) {
        console.log('Error parseando respuesta rendición:', e);
        console.log('Texto recibido:', errorText);
      }
      console.log('Error al guardar la rendición:', error);
      alert('Error al guardar la rendición: ' + JSON.stringify(error));
      return;
    }

    // Recargar la lista de rendiciones
    fetch('http://localhost:8000/api/rendiciones/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setRendiciones(Array.isArray(data) ? data : data.results || []));
    setShowForm(false);
    setForm({ proyecto: '', documento: null, monto_rendido: '', descripcion: '', fecha_rendicion: '' });
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
                <label className="block text-taupe mb-1">Documento PDF</label>
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
                <th className="px-4 py-2 text-left text-taupe">ID</th>
                <th className="px-4 py-2 text-left text-taupe">Estado</th>
                <th className="px-4 py-2 text-left text-taupe">Fecha</th>
                <th className="px-4 py-2 text-left text-taupe">PDF</th>
              </tr>
            </thead>
            <tbody>
                {rendiciones.map(r => (
                  <tr key={r.id} className="border-b">
                    <td className="px-4 py-2">{r.id}</td>
                    <td className="px-4 py-2">{r.estado_aprobacion || '-'}</td>
                    <td className="px-4 py-2">{formatFechaCL(r.fecha_rendicion) || '-'}</td>
                    <td className="px-4 py-2 text-center">
                    {(() => {
                      console.log('Rendición en fila:', r);
                      console.log('Documento en fila:', r.documento);
                      if (r.documento && typeof r.documento === 'object') {
                        if (r.documento.archivo) {
                          console.log('URL archivo:', r.documento.archivo);
                        }
                        if (r.documento.archivo && r.documento.archivo !== "") {
                          return (
                            <a href={r.documento.archivo} download target="_blank" rel="noopener noreferrer" title="Descargar PDF">
                              <button className="bg-indigo text-white px-3 py-1 rounded shadow hover:bg-taupe transition">Descargar PDF</button>
                            </a>
                          );
                        }
                      }
                      return '-';
                    })()}
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