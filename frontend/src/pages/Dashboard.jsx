import React, { useEffect, useState } from 'react';
import DashboardCard from '../components/DashboardCard';

// --- NUEVO COMPONENTE ---
// Creamos un componente solo para estadísticas (sin formato de moneda)
function DashboardStatCard({ titulo, valor, color = "taupe" }) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 border border-gray-200`}>
      <div className="text-sm text-taupe">{titulo}</div>
      <div className={`text-2xl font-bold text-${color}`}>{valor}</div>
    </div>
  );
}
// ------------------------

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
      fetch('http://localhost:8000/api/comunidades/socios/', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.ok ? res.json() : []),
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
    // ... (El código de la vista de Auditor no se modifica por ahora)
    // ... (Puedes pegar tu código de auditor aquí si lo necesitas)
    return (
      <div className="space-y-8">
        {/* ... tu lógica de auditor ... */}
      </div>
    );
  }

  // Vista estándar para comunidades/admin
  return (
    <div className="space-y-8 ">
      {/* Cards de montos (Usamos DashboardCard) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {loading ? (
          <div className="col-span-3 text-center text-taupe">Cargando...</div>
        ) : (() => {
          let montoAsignado = periodos.reduce((acc, p) => acc + (parseFloat(p.monto_asignado) || 0), 0);
          
          // --- CORRECCIÓN DE CÁLCULO ---
          // Usamos 'total_rendido' del proyecto (el más preciso) o 'monto_rendido' de la rendición
          // Vamos a basarnos en las rendiciones, que es más exacto
          let montoRendido = rendiciones.reduce((acc, r) => acc + (parseFloat(r.monto_rendido) || 0), 0);
          // -----------------------------

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

      {/* --- SECCIÓN DE AUDITORÍA CORREGIDA --- */}
      {/* Usamos el nuevo DashboardStatCard para los contadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          <div className="col-span-4 text-center text-taupe">Cargando...</div>
        ) : proyectos ? (
          <>
            <DashboardStatCard titulo="Proyectos Totales" valor={proyectos.length} color="indigo" />
            {/* Asumimos la siguiente lógica:
              - 'Borrador' (del backend) = 'Pendiente de Validación' (en el frontend)
              - 'Aprobado' (del backend) = 'Validado' (en el frontend)
            */}
            <DashboardStatCard titulo="Pendiente de Validación" valor={proyectos.filter(p => p.estado === 'Borrador').length} color="taupe" />
            <DashboardStatCard titulo="Proyectos Validados" valor={proyectos.filter(p => p.estado === 'Aprobado').length} color="taupe" />
            <DashboardStatCard titulo="Proyectos Rechazados" valor={proyectos.filter(p => p.estado === 'Rechazado').length} color="taupe" />
          </>
        ) : (
          <div className="col-span-4 text-center text-taupe">Sin datos aún</div>
        )}
      </div>
      {/* ------------------------------------ */}


     {/* --- SECCIÓN PROYECTOS RECIENTES (LÓGICA CORREGIDA) --- */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mt-6">
        <div className="font-bold text-deep-purple mb-2">Proyectos Recientes</div>
        <div className="text-taupe mb-4">Últimos proyectos en gestión</div>
        {loading ? (
          <div className="text-center text-taupe">Cargando...</div>
        ) : proyectos && proyectos.length > 0 ? (
          <div className="space-y-4">
            {proyectos.sort((a, b) => b.id - a.id).slice(0, 5).map((p) => {
              
              const presupuesto = p.presupuesto_total || 0;
              
              // --- ¡AQUÍ ESTÁ LA NUEVA LÓGICA! ---
              // 1. Filtramos la lista de todas las rendiciones
              const rendiciones_del_proyecto = rendiciones.filter(r => r.proyecto === p.id);
              // 2. Sumamos el total solo para este proyecto
              const rendido = rendiciones_del_proyecto.reduce((acc, r) => acc + (parseFloat(r.monto_rendido) || 0), 0);
              // ------------------------------------
              
              const porcentaje = presupuesto > 0 ? Math.round((rendido / presupuesto) * 100) : 0;

              return (
                <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-deep-purple">{p.nombre || 'Sin datos aún'}</div>
                    <span className={`px-3 py-1 rounded-lg text-white text-xs font-bold ${
                      p.estado === 'Validado' ? 'bg-green-500' : 
                      p.estado === 'Rechazado' ? 'bg-red-500' : 'bg-taupe'
                    }`}>
                      {p.estado === 'Borrador' ? 'Pendiente Val.' : p.estado}
                    </span>
                  </div>
                  
                  <div className="text-sm text-taupe">Presupuesto: ${formatMonto(presupuesto)}</div>
                  {/* Esta línea ahora usará la suma manual 'rendido' */}
                  <div className="text-sm text-taupe">Rendido: ${formatMonto(rendido)}</div>

                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-indigo rounded-full" style={{ width: `${porcentaje}%` }}></div>
                  </div>
                  <div className="text-right text-xs text-indigo font-bold">{porcentaje}% Rendido</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-taupe">Sin datos aún</div>
        )}
      </div>
      {/* ------------------------------------ */}
    </div>
  );
}