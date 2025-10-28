function formatFechaCL(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d)) return fecha;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}
import React, { useEffect, useState } from 'react';
import TablaGenerica from '../components/TablaGenerica';

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
  // ...existing code...
  const [asc, setAsc] = useState(false);
  const [montoAnteriorEdit, setMontoAnteriorEdit] = useState('');
  const [editandoMonto, setEditandoMonto] = useState(false);

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
  // Ordenar periodos
  const periodosTabla = ordenarPorFecha(periodos, asc);

  return (
    <div className="space-y-8">
        {loading ? (
        <div className="text-center text-taupe">Cargando...</div>
      ) : (
        <>
          {periodoActual && (
            <div className="periodo-card">
              <div className="periodo-card-separator"></div>
              <div className="periodo-card-title">Periodo Actual</div>
              <div className="periodo-card-subtitle">{periodoActual.nombre}</div>
              <div className="periodo-card-data">Inicio: {formatFechaCL(periodoActual.fecha_inicio)}</div>
              <div className="periodo-card-data">Fin: {formatFechaCL(periodoActual.fecha_fin)}</div>
              <div className="periodo-card-data font-bold">Monto Asignado: ${formatMonto(periodoActual.monto_asignado)}</div>
             
            </div>
          )}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <button
              className="bg-indigo text-white px-4 py-2 rounded-lg font-semibold shadow"
              onClick={() => setAsc(a => !a)}
            >
              Ordenar por fecha {asc ? '↑' : '↓'}
            </button>
          </div>
          <TablaGenerica
            columns={[
              { key: 'nombre', label: 'Nombre' },
              { key: 'fecha_inicio', label: 'Inicio' },
              { key: 'fecha_fin', label: 'Fin' },
              { key: 'monto_asignado', label: 'Monto Asignado' },
              { key: 'estado', label: 'Estado' },
            ]}
            data={periodosTabla.map(p => ({
              ...p,
              fecha_inicio: formatFechaCL(p.fecha_inicio),
              fecha_fin: formatFechaCL(p.fecha_fin),
              monto_asignado: `$${formatMonto(p.monto_asignado)}`,
              estado: esPeriodoActual(p)
                ? <span className="bg-blush text-deep-purple font-bold px-2 py-1 rounded-lg text-xs">Actual</span>
                : <span className="bg-taupe text-white px-2 py-1 rounded-lg text-xs">Finalizado</span>
            }))}
            emptyText="Sin datos aún"
            rowsPerPage={8}
          />
        </>
      )}
    </div>
  );
}
