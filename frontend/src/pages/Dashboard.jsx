import React, { useEffect, useState } from 'react';

function formatMonto(monto) {
  if (monto === undefined || monto === null || isNaN(monto)) return 'Sin datos aún';
  return Number(monto).toLocaleString('es-CL', { maximumFractionDigits: 0 });
}

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [proyectos, setProyectos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access');
    async function fetchData() {
      setLoading(true);
      try {
        // KPIs y progreso presupuestario
        const resKpi = await fetch('http://localhost:8000/api/dashboard/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const kpiData = await resKpi.ok ? await resKpi.json() : null;
        setKpis(kpiData);
        // Proyectos recientes
        const resProy = await fetch('http://localhost:8000/api/proyectos/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const proyData = await resProy.ok ? await resProy.json() : null;
        setProyectos(proyData);
      } catch {
        setKpis(null);
        setProyectos(null);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8 ">
      <h2 className="text-2xl font-bold text-deep-purple">Dashboard</h2>
      <p className="text-taupe">Resumen general de la gestión financiera</p>
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-4 text-center text-taupe">Cargando...</div>
        ) : kpis ? (
          <>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border border-gray-200">
              <div className="font-semibold text-taupe">Monto Total Asignado</div>
              <div className="text-2xl font-bold text-indigo">{formatMonto(kpis.monto_total_asignado)}</div>
              <div className="text-sm text-taupe">{kpis.monto_periodo_anterior ? `+${formatMonto(kpis.monto_periodo_anterior)} del periodo anterior` : ''}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border border-gray-200">
              <div className="font-semibold text-taupe">Cantidad de Proyectos</div>
              <div className="text-2xl font-bold text-indigo">{kpis.cantidad_proyectos || 'Sin datos aún'}</div>
              <div className="text-sm text-taupe">{kpis.proyectos_activos || ''}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border border-gray-200">
              <div className="font-semibold text-taupe">Total Rendido</div>
              <div className="text-2xl font-bold text-indigo">{formatMonto(kpis.total_rendido)}</div>
              <div className="text-sm text-taupe">{kpis.porcentaje_rendido || ''}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border border-gray-200">
              <div className="font-semibold text-taupe">Total Por Rendir</div>
              <div className="text-2xl font-bold text-orange-600">{formatMonto(kpis.total_por_rendir)}</div>
              <div className="text-sm text-orange-600">{kpis.porcentaje_por_rendir || ''}</div>
            </div>
          </>
        ) : (
          <div className="col-span-4 text-center text-taupe">Sin datos aún</div>
        )}
      </div>
      {/* Progreso Presupuestario */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mt-6">
        <div className="font-bold text-deep-purple mb-2">Progreso de Ejecución Presupuestaria</div>
        <div className="text-taupe mb-2">Seguimiento del gasto total del periodo actual</div>
        {kpis ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-indigo">Rendido: {formatMonto(kpis.total_rendido)}</span>
              <span className="text-indigo">{kpis.porcentaje_rendido || ''}</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full mb-2">
              <div className="h-3 bg-indigo rounded-full" style={{ width: kpis.porcentaje_rendido ? kpis.porcentaje_rendido : '0%' }}></div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Monto Asignado<br /><span className="font-bold">{formatMonto(kpis.monto_total_asignado)}</span></span>
              <span>Pendiente de Rendir<br /><span className="font-bold text-orange-600">{formatMonto(kpis.total_por_rendir)}</span></span>
            </div>
          </>
        ) : (
          <div className="text-center text-taupe">Sin datos aún</div>
        )}
      </div>
      {/* Proyectos Recientes */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mt-6">
        <div className="font-bold text-deep-purple mb-2">Proyectos Recientes</div>
        <div className="text-taupe mb-4">Últimos proyectos en gestión</div>
        {loading ? (
          <div className="text-center text-taupe">Cargando...</div>
        ) : proyectos && proyectos.length > 0 ? (
          <div className="space-y-4">
            {proyectos.map((p, idx) => {
              const porcentaje = p.presupuesto > 0 ? Math.round((p.rendido / p.presupuesto) * 100) : 0;
              return (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-deep-purple">{p.nombre || 'Sin datos aún'}</div>
                    <span className={`px-3 py-1 rounded-lg text-white text-xs font-bold ${p.estado === 'Activo' ? 'bg-indigo' : 'bg-taupe'}`}>{p.estado || 'Sin datos aún'}</span>
                  </div>
                  <div className="text-sm text-taupe">Presupuesto: {p.presupuesto ? `$${formatMonto(p.presupuesto)}` : 'Sin datos aún'}</div>
                  <div className="text-sm text-taupe">Rendido: {p.rendido ? `$${formatMonto(p.rendido)}` : 'Sin datos aún'}</div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-indigo rounded-full" style={{ width: `${porcentaje}%` }}></div>
                  </div>
                  <div className="text-right text-xs text-indigo font-bold">{porcentaje ? `${porcentaje}%` : 'Sin datos aún'}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-taupe">Sin datos aún</div>
        )}
      </div>
    </div>
  );
}
