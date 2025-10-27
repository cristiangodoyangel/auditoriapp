import React, { useEffect, useState } from 'react';

function esPeriodoActual(periodo) {
  const hoy = new Date();
  const inicio = new Date(periodo.fecha_inicio);
  const fin = new Date(periodo.fecha_fin);
  return hoy >= inicio && hoy <= fin;
}

function ordenarPorFecha(periodos, asc = true) {
  return [...periodos].sort((a, b) => {
    const fa = new Date(a.fecha_inicio);
    const fb = new Date(b.fecha_inicio);
    return asc ? fa - fb : fb - fa;
  });
}

function formatMonto(monto) {
  if (monto === undefined || monto === null || isNaN(monto)) return 'Sin datos';
  return Number(monto).toLocaleString('es-CL', { maximumFractionDigits: 0 });
}

export default function Periodos() {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [asc, setAsc] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access');
    async function fetchPeriodos() {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/periodos/periodos/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.ok ? await res.json() : [];
        setPeriodos(data);
      } catch {
        setPeriodos([]);
      }
      setLoading(false);
    }
    fetchPeriodos();
  }, []);

  // Separar periodo actual
  const periodoActual = periodos.find(esPeriodoActual);
  // Mostrar todos los periodos en la tabla
  let periodosTabla = ordenarPorFecha(periodos, asc);
  // Filtro de búsqueda
  if (search) {
    periodosTabla = periodosTabla.filter(p =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.fecha_inicio.includes(search) ||
      p.fecha_fin.includes(search)
    );
  }
  // Paginación
  const totalPages = Math.ceil(periodosTabla.length / rowsPerPage);
  const pagedPeriodos = periodosTabla.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-deep-purple">Periodos Financieros</h2>
      <p className="text-taupe">Gestión de periodos y asignaciones presupuestarias</p>
      {loading ? (
        <div className="text-center text-taupe">Cargando...</div>
      ) : (
        <>
          {periodoActual && (
            <div className="bg-indigo text-white rounded-lg p-6 mb-6 shadow border-2 border-indigo">
              <div className="text-lg font-bold">Periodo Actual</div>
              <div className="font-semibold">{periodoActual.nombre}</div>
              <div>Inicio: {periodoActual.fecha_inicio}</div>
              <div>Fin: {periodoActual.fecha_fin}</div>
              <div>Monto Asignado: ${formatMonto(periodoActual.monto_asignado)}</div>
              <div>Monto Anterior: ${formatMonto(periodoActual.monto_anterior)}</div>
            </div>
          )}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <input
              type="text"
              className="border rounded-lg px-3 py-2 w-full md:w-1/3"
              placeholder="Buscar por nombre o fecha..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            <button
              className="bg-indigo text-white px-4 py-2 rounded-lg font-semibold shadow"
              onClick={() => setAsc(a => !a)}
            >
              Ordenar por fecha {asc ? '↑' : '↓'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">Inicio</th>
                  <th className="px-4 py-2 text-left">Fin</th>
                  <th className="px-4 py-2 text-left">Monto Asignado</th>
                  <th className="px-4 py-2 text-left">Monto Anterior</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {pagedPeriodos.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-taupe py-4">Sin datos aún</td></tr>
                )}
                {pagedPeriodos.map((p, idx) => (
                  <tr key={p.id} className={esPeriodoActual(p) ? 'bg-indigo/10 font-bold' : ''}>
                    <td className="px-4 py-2">{p.nombre}</td>
                    <td className="px-4 py-2">{p.fecha_inicio}</td>
                    <td className="px-4 py-2">{p.fecha_fin}</td>
                    <td className="px-4 py-2">${formatMonto(p.monto_asignado)}</td>
                    <td className="px-4 py-2">${formatMonto(p.monto_anterior)}</td>
                    <td className="px-4 py-2">
                      {esPeriodoActual(p) ? (
                        <span className="bg-indigo text-white px-2 py-1 rounded-lg text-xs">Actual</span>
                      ) : (
                        <span className="bg-taupe text-white px-2 py-1 rounded-lg text-xs">Finalizado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Paginación */}
          <div className="flex justify-end items-center gap-2 mt-4">
            <button
              className="px-3 py-1 rounded-lg border bg-white text-indigo font-bold disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >Anterior</button>
            <span className="text-taupe">Página {page} de {totalPages}</span>
            <button
              className="px-3 py-1 rounded-lg border bg-white text-indigo font-bold disabled:opacity-50"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >Siguiente</button>
          </div>
        </>
      )}
    </div>
  );
}
