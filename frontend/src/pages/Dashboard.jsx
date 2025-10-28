

import React, { useEffect, useState } from 'react';
import DashboardCard from '../components/DashboardCard';

function formatMonto(monto) {
  if (monto === undefined || monto === null || isNaN(monto)) return 'Sin datos aún';
  return Number(monto).toLocaleString('es-CL', { maximumFractionDigits: 0 });
}

export default function Dashboard() {
  const [proyectos, setProyectos] = useState([]);
  const [comunidades, setComunidades] = useState([]);
  const [socios, setSocios] = useState([]);
  const [rendiciones, setRendiciones] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [comunidadId, setComunidadId] = useState('');
  const [loading, setLoading] = useState(true);

  // Detectar si el usuario es auditor
  let isAuditor = false;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    isAuditor = user && (user.rol === 'auditor' || user.role === 'auditor');
  } catch {}

  useEffect(() => {
    const token = localStorage.getItem('access');
    setLoading(true);
    Promise.all([
      fetch('http://localhost:8000/api/proyectos/', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.ok ? res.json() : []),
      fetch('http://localhost:8000/api/comunidades/', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.ok ? res.json() : []),
      fetch('http://localhost:8000/api/socios/', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.ok ? res.json() : []),
      fetch('http://localhost:8000/api/rendiciones/', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.ok ? res.json() : []),
      fetch('http://localhost:8000/api/periodos/periodos/', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.ok ? res.json() : [])
    ]).then(([proy, coms, socs, rends, pers]) => {
      setProyectos(Array.isArray(proy) ? proy : proy.results || []);
      setComunidades(Array.isArray(coms) ? coms : coms.results || []);
      setSocios(Array.isArray(socs) ? socs : socs.results || []);
      setRendiciones(Array.isArray(rends) ? rends : rends.results || []);
      setPeriodos(Array.isArray(pers) ? pers : pers.results || []);
      setLoading(false);
    }).catch(() => {
      setProyectos([]);
      setComunidades([]);
      setSocios([]);
      setRendiciones([]);
      setPeriodos([]);
      setLoading(false);
    });
  }, []);

  if (isAuditor) {
    // Vista especial para auditor
    return (
      <div className="space-y-8">
        {/* Cards auditor globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {loading ? (
            <div className="col-span-3 text-center text-taupe">Cargando...</div>
          ) : (
            <>
              <DashboardCard titulo="Comunidades Totales" monto={comunidades.length} color="indigo" />
              <DashboardCard titulo="Administradores Totales" monto={32} color="taupe" />
              <DashboardCard titulo="Proyectos Totales" monto={proyectos.length} color="taupe" />
            </>
          )}
        </div>

        {/* Selector de comunidad */}
        <div className="mb-6">
          <label className="block text-taupe mb-2 font-semibold">Selecciona una comunidad:</label>
          <select className="border rounded px-3 py-2 w-full max-w-md" value={comunidadId} onChange={e => setComunidadId(e.target.value)}>
            <option value="">-- Selecciona --</option>
            {comunidades.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        {/* Resumen comunidad seleccionada */}
        {comunidadId && (() => {
          const comunidad = comunidades.find(c => String(c.id) === String(comunidadId));
          // Filtrar socios reales de la comunidad
          const sociosCom = socios.filter(s => String(s.comunidad) === String(comunidadId)).length;
          const proyectosCom = proyectos.filter(p => String(p.comunidad) === String(comunidadId));
          const rendicionesCom = rendiciones.filter(r => String(r.proyecto?.comunidad) === String(comunidadId));
          const montoAsignado = proyectosCom.reduce((acc, p) => acc + (parseFloat(p.presupuesto_total) || 0), 0);
          const montoRendido = rendicionesCom.reduce((acc, r) => acc + (parseFloat(r.monto_rendido) || 0), 0);
          const montoPorRendir = montoAsignado - montoRendido;
          return (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mb-6">
              <div className="font-bold text-deep-purple mb-2">Resumen de Comunidad</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-semibold text-taupe">Nombre:</span> {comunidad?.nombre || '-'}</div>
                <div><span className="font-semibold text-taupe">Cantidad de socios:</span> {sociosCom}</div>
                <div><span className="font-semibold text-taupe">Monto asignado total:</span> ${formatMonto(montoAsignado)}</div>
                <div><span className="font-semibold text-taupe">Total rendido:</span> ${formatMonto(montoRendido)}</div>
                <div><span className="font-semibold text-taupe">Total por rendir:</span> ${formatMonto(montoPorRendir)}</div>
              </div>
            </div>
          );
        })()}

        {/* Cards de proyectos por comunidad */}
        {comunidadId && (() => {
          const proyectosCom = proyectos.filter(p => String(p.comunidad) === String(comunidadId));
          const proyectosAprobados = proyectosCom.filter(p => p.estado === 'Aprobado').length;
          const proyectosPendientes = proyectosCom.filter(p => p.estado === 'Pendiente').length;
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <DashboardCard titulo="Proyectos Totales" monto={proyectosCom.length} color="indigo" />
              <DashboardCard titulo="Proyectos Aprobados" monto={proyectosAprobados} color="taupe" />
              <DashboardCard titulo="Proyectos Pendientes" monto={proyectosPendientes} color="taupe" />
            </div>
          );
        })()}

        {/* Cards de rendiciones por comunidad */}
        {comunidadId && (() => {
          const proyectosCom = proyectos.filter(p => String(p.comunidad) === String(comunidadId));
          const rendicionesCom = rendiciones.filter(r => proyectosCom.some(p => p.id === r.proyecto));
          const totalRendiciones = rendicionesCom.length;
          const rendicionesAprobadas = rendicionesCom.filter(r => r.estado_aprobacion === 'Aprobado').length;
          const rendicionesPendientes = rendicionesCom.filter(r => r.estado_aprobacion === 'Pendiente').length;
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <DashboardCard titulo="Rendiciones Totales" monto={totalRendiciones} color="indigo" />
              <DashboardCard titulo="Rendiciones Aprobadas" monto={rendicionesAprobadas} color="taupe" />
              <DashboardCard titulo="Rendiciones Pendientes" monto={rendicionesPendientes} color="taupe" />
            </div>
          );
        })()}
      </div>
    );
  }

  // Vista estándar para comunidades/admin
  return (
    <div className="space-y-8 ">
      {/* Cards de montos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {loading ? (
          <div className="col-span-3 text-center text-taupe">Cargando...</div>
        ) : (() => {
          // Monto asignado desde periodos (igual que en la page de periodos)
          let montoAsignado = periodos.reduce((acc, p) => acc + (parseFloat(p.monto_asignado) || 0), 0);
          let montoRendido = rendiciones.reduce((acc, r) => acc + (parseFloat(r.monto_rendido || r.total_rendido) || 0), 0);
          let montoPorRendir = montoAsignado - montoRendido;
          return (
            <>
              <DashboardCard titulo="Monto Asignado" monto={montoAsignado} color="indigo" />
              <DashboardCard titulo="Monto Rendido" monto={montoRendido} color="taupe" />
              <DashboardCard titulo="Monto por Rendir" monto={montoPorRendir} color="taupe" />
            </>
          );
        })()}
      </div>
      <h2 className="text-2xl font-bold text-deep-purple"></h2>
      <p className="text-taupe"></p>

      {/* Cards resumen de proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          <div className="col-span-4 text-center text-taupe">Cargando...</div>
        ) : proyectos ? (
          <>
            <DashboardCard titulo="Proyectos Totales" monto={proyectos.length} color="taupe" />
            <DashboardCard titulo="Proyectos Aprobados" monto={proyectos.filter(p => p.estado === 'Aprobado').length} color="taupe" />
            <DashboardCard titulo="Proyectos Pendientes" monto={proyectos.filter(p => p.estado === 'Pendiente').length} color="taupe" />
            <DashboardCard titulo="Proyectos Rechazados" monto={proyectos.filter(p => p.estado === 'Rechazado').length} color="taupe" />
          </>
        ) : (
          <div className="col-span-4 text-center text-taupe">Sin datos aún</div>
        )}
      </div>

      {/* KPIs eliminados por revertir lógica. */}
      {/* ...existing code... */}
      {/* Progreso Presupuestario eliminado por revertir lógica. */}
      {/* ...existing code... */}
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
