import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TablaGenerica from '../components/TablaGenerica';
import { apiFetch } from '../utils/api';

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

export default function Periodos() {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [asc, setAsc] = useState(false);
  const [montoAnteriorEdit, setMontoAnteriorEdit] = useState('');
  const [editandoMonto, setEditandoMonto] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPeriodos() {
      setLoading(true);
      try {
        const res = await apiFetch('/periodos/periodos/');
        const data = res.ok ? await res.json() : [];
        setPeriodos(Array.isArray(data) ? data : data.results || []);
      } catch {
        setPeriodos([]);
      }
      setLoading(false);
    }
    fetchPeriodos();
  }, []);

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
          {periodoActual ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-box bg-base-200 shadow-sm">
              <div className="stat text-center md:text-left p-0 place-items-center md:place-items-start">
                <div className="stat-title text-lg font-bold">
                  {periodoActual.nombre} (Actual)
                </div>
                <div className="stat-value text-primary text-3xl my-1">
                  {formatMonto(periodoActual.monto_asignado)}
                </div>
                <div className="stat-desc text-sm">{`Del ${formatFechaCL(
                  periodoActual.fecha_inicio
                )} al ${formatFechaCL(periodoActual.fecha_fin)}`}</div>
              </div>

              <button
                className="btn btn-primary w-full md:w-auto"
                onClick={() => navigate("/crear-periodo")}
              >
                Crear Nuevo Periodo
              </button>
            </div>
          ) : (
            <div className="flex justify-end">
               <button
                className="btn btn-primary"
                onClick={() => navigate("/crear-periodo")}
              >
                Crear Primer Periodo
              </button>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setAsc((a) => !a)}
            >
              Ordenar por fecha {asc ? "↑" : "↓"}
            </button>
          </div>

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