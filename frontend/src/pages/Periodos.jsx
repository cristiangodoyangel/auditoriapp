import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TablaGenerica from '../components/TablaGenerica';

// --- Funciones Helper (Lógica) ---

function formatFechaCL(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d)) return fecha;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function esPeriodoActual(periodo) {
  const hoy = new Date();
  const inicioParts = periodo.fecha_inicio.split('-');
  const finParts = periodo.fecha_fin.split('-');
  const inicio = new Date(inicioParts[0], inicioParts[1] - 1, inicioParts[2]);
  const fin = new Date(finParts[0], finParts[1] - 1, finParts[2]);
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
  if (monto === undefined || monto === null || isNaN(monto)) return '$0';
  return '$' + Number(monto).toLocaleString('es-CL', { maximumFractionDigits: 0 });
}

// --- Componente Principal ---
export default function Periodos() {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [asc, setAsc] = useState(false);
  const [montoAnteriorEdit, setMontoAnteriorEdit] = useState('');
  const [editandoMonto, setEditandoMonto] = useState(false);

  const navigate = useNavigate();

  // (Tu useEffect de fetch está perfecto)
  useEffect(() => {
    // ... tu lógica de fetch ...
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

  // (Tu lógica de datos está perfecta)
  const periodoActual = periodos.find(esPeriodoActual);
  const periodosTabla = ordenarPorFecha(periodos, asc);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center p-12">
          <span className="loading loading-lg loading-spinner text-primary"></span>
        </div>
      ) : (
        <>
          {/* --- CAMBIO DAISYUI: Reemplazamos Card por Stat --- */}
          {periodoActual && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-box bg-base-200 shadow-sm">
              <div className="stat text-center">
                <div className="stat-title">
                  {periodoActual.nombre} (Actual)
                </div>
                <div className="stat-value text-primary">
                  {formatMonto(periodoActual.monto_asignado)}
                </div>
                <div className="stat-desc">{`Del ${formatFechaCL(
                  periodoActual.fecha_inicio
                )} al ${formatFechaCL(periodoActual.fecha_fin)}`}</div>
              </div>

              <button
                className="btn btn-primary md:items-center"
                onClick={() => navigate("/crear-periodo")}
              >
                Crear Nuevo Periodo
              </button>
            </div>
          )}
          {/* --- Fin del cambio --- */}

          {/* --- Fila de Botones (Sin cambios) --- */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <button
              className="btn btn-outline"
              onClick={() => setAsc((a) => !a)}
            >
              Ordenar por fecha {asc ? "↑" : "↓"}
            </button>
          </div>
          {/* ------------------------------------ */}

          {/* --- TablaGenerica (Sin cambios) --- */}
          <TablaGenerica
            columns={[
              { key: "nombre", label: "Nombre" },
              { key: "fecha_inicio", label: "Inicio" },
              { key: "fecha_fin", label: "Fin" },
              { key: "monto_asignado", label: "Monto Asignado" },
              { key: "estado", label: "Estado" },
            ]}
            data={periodosTabla.map((p) => ({
              ...p,
              fecha_inicio: formatFechaCL(p.fecha_inicio),
              fecha_fin: formatFechaCL(p.fecha_fin),
              monto_asignado: formatMonto(p.monto_asignado),
              estado: esPeriodoActual(p) ? (
                <div className="badge badge-primary badge-outline">Actual</div>
              ) : (
                <div className="badge badge-ghost">Finalizado</div>
              ),
            }))}
            emptyText="No hay periodos registrados"
            rowsPerPage={8}
          />
        </>
      )}
    </div>
  );
}