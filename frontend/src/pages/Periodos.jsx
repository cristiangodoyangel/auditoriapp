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
import { useNavigate } from 'react-router-dom'; // <-- 1. IMPORTAR useNavigate
import TablaGenerica from '../components/TablaGenerica';

function esPeriodoActual(periodo) {
  const hoy = new Date();
  // Asegurarse de que las fechas se interpreten correctamente como locales
  const inicioParts = periodo.fecha_inicio.split('-');
  const finParts = periodo.fecha_fin.split('-');
  
  // new Date(YYYY, MM-1, DD)
  const inicio = new Date(inicioParts[0], inicioParts[1] - 1, inicioParts[2]);
  const fin = new Date(finParts[0], finParts[1] - 1, finParts[2]);
  
  // Ajustar el fin para que incluya todo el día
  fin.setHours(23, 59, 59, 999);
  
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
  const [asc, setAsc] = useState(false);
  const [montoAnteriorEdit, setMontoAnteriorEdit] = useState('');
  const [editandoMonto, setEditandoMonto] = useState(false);

  const navigate = useNavigate(); // <-- 2. AÑADIR EL HOOK

  useEffect(() => {
    const token = localStorage.getItem('access');
    async function fetchPeriodos() {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/periodos/periodos/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.ok ? await res.json() : [];
        setPeriodos(Array.isArray(data) ? data : data.results || []);
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
          {/* (No necesitamos el modal aquí, si no hay periodo, la tarjeta no se muestra) */}
          {periodoActual && (
            <div className="periodo-card bg-indigo text-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
              {/* <div className="periodo-card-separator"></div> */}
              <div className="periodo-card-title text-center text-2xl font-bold mb-2">Periodo Actual</div>
              <div className="periodo-card-subtitle text-center text-lg mb-4">{periodoActual.nombre}</div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="periodo-card-data">Inicio:</div>
                <div className="periodo-card-data">{formatFechaCL(periodoActual.fecha_inicio)}</div>
                <div className="periodo-card-data">Fin:</div>
                <div className="periodo-card-data">{formatFechaCL(periodoActual.fecha_fin)}</div>
              </div>
              <div className="text-center mt-4 text-xl font-bold">Monto Asignado: ${formatMonto(periodoActual.monto_asignado)}</div>
            </div>
          )}

          {/* --- 3. AÑADIR BOTÓN DE CREAR PERIODO --- */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <button
              className="bg-indigo text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-taupe"
              onClick={() => setAsc(a => !a)}
            >
              Ordenar por fecha {asc ? '↑' : '↓'}
            </button>
            <button
              className="bg-indigo text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-taupe"
              onClick={() => navigate('/crear-periodo')}
            >
              Crear Nuevo Periodo
            </button>
          </div>
          {/* ------------------------------------ */}

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
                ? <span className="bg-green-200 text-green-800 font-bold px-2 py-1 rounded-lg text-xs">Actual</span>
                : <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-lg text-xs">Finalizado</span>
            }))}
            emptyText="No hay periodos registrados"
            rowsPerPage={8}
          />
        </>
      )}
    </div>
  );
}