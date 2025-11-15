import React, { useEffect, useState } from 'react';
// --- CAMBIO DAISYUI ---
// Ya no necesitamos 'DashboardCard' ni 'DashboardStatCard'
// import DashboardCard from '../components/DashboardCard';

function formatMonto(monto) {
  // --- CAMBIO DAISYUI ---
  // Formateamos en $ y sin decimales
  if (monto === undefined || monto === null || isNaN(monto)) return '$0';
  return '$' + Number(monto).toLocaleString('es-CL', { maximumFractionDigits: 0 });
}

export default function Dashboard() {
  const [proyectos, setProyectos] = useState([]);
  // (Omití el resto de 'useState' por brevedad, tu lógica de fetch está perfecta)
  const [rendiciones, setRendiciones] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);

  let isAuditor = false;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    isAuditor = user && (user.rol === 'auditor' || user.role === 'auditor');
  } catch {}

  // Tu useEffect de fetch está perfecto, no necesita cambios
  useEffect(() => {
    const token = localStorage.getItem('access');
    setLoading(true);
    Promise.all([
      fetch('http://localhost:8000/api/proyectos/', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.ok ? res.json() : []),
      fetch('http://localhost:8000/api/rendiciones/', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.ok ? res.json() : []),
      fetch('http://localhost:8000/api/periodos/periodos/', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.ok ? res.json() : [])
    ]).then(([proy, rends, pers]) => {
      setProyectos(Array.isArray(proy) ? proy : proy.results || []);
      setRendiciones(Array.isArray(rends) ? rends : rends.results || []);
      setPeriodos(Array.isArray(pers) ? pers : pers.results || []);
      setLoading(false);
    }).catch(() => {
      // (Manejo de error)
      setProyectos([]);
      setRendiciones([]);
      setPeriodos([]);
      setLoading(false);
    });
  }, []);

  if (isAuditor) {
    // ... tu lógica de auditor ...
    return (
      <div className="space-y-8">
        <h2>Vista de Auditor</h2>
      </div>
    );
  }

  // --- LÓGICA DE CÁLCULO (sin cambios) ---
  let montoAsignado = 0;
  let montoRendido = 0;
  let montoPorRendir = 0;

  if (!loading) {
    montoAsignado = periodos.reduce((acc, p) => acc + (parseFloat(p.monto_asignado) || 0), 0);
    montoRendido = rendiciones.reduce((acc, r) => acc + (parseFloat(r.monto_rendido) || 0), 0);
    montoPorRendir = montoAsignado - montoRendido;
  }
  
  const totalProyectos = proyectos.length;
  const proyectosPendientes = proyectos.filter(p => p.estado === 'Borrador').length;
  const proyectosValidados = proyectos.filter(p => p.estado === 'Aprobado').length;
  const proyectosRechazados = proyectos.filter(p => p.estado === 'Rechazado').length;
  // ------------------------------------

  return (
    <div className="space-y-6">
         <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 p-4 rounded-box bg-base-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-primary">ESTADO ACTUAL DE SU COMUNIDAD</h2>
          <p className="text-base-content/70">
            Resumen de montos y proyectos en gestión
          </p>
        </div>
        
      </div>
      
      {/* --- CAMBIO DAISYUI: Sección Montos (Stats) --- */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
        
        <div className="stat">
          <div className="stat-title">Monto Asignado</div>
          <div className="stat-value text-primary">{loading ? "..." : formatMonto(montoAsignado)}</div>
          <div className="stat-desc">Total de fondos del periodo</div>
        </div>
        
        <div className="stat">
          <div className="stat-title">Monto Rendido</div>
          <div className="stat-value text-primary">{loading ? "..." : formatMonto(montoRendido)}</div>
          <div className="stat-desc">Total gastado y justificado</div>
        </div>
        
        <div className="stat">
          <div className="stat-title">Monto por Rendir</div>
          <div className="stat-value text-warning">{loading ? "..." : formatMonto(montoPorRendir)}</div>
          <div className="stat-desc">Saldo restante</div>
        </div>
        
      </div>
      {/* ------------------------------------ */}

      {/* --- CAMBIO DAISYUI: Sección Auditoría (Stats) --- */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
        
        <div className="stat">
          <div className="stat-title">Proyectos Totales</div>
          <div className="stat-value">{loading ? "..." : totalProyectos}</div>
        </div>
        
        <div className="stat">
          <div className="stat-title">Pendiente de Validación</div>
          <div className="stat-value text-warning">{loading ? "..." : proyectosPendientes}</div>
        </div>
        
        <div className="stat">
          <div className="stat-title">Proyectos Validados</div>
          <div className="stat-value text-primary">{loading ? "..." : proyectosValidados}</div>
        </div>

        <div className="stat">
          <div className="stat-title">Proyectos Rechazados</div>
          <div className="stat-value text-primary">{loading ? "..." : proyectosRechazados}</div>
        </div>
        
      </div>
      {/* ------------------------------------ */}


     {/* --- CAMBIO DAISYUI: Sección Proyectos Recientes (Card) --- */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Proyectos Recientes</h2>
          <p className="text-base-content/70 mb-4">Últimos proyectos en gestión</p>

          {loading ? (
            <div className="text-center p-4">Cargando...</div>
          ) : proyectos && proyectos.length > 0 ? (
            <div className="space-y-4">
              {proyectos.sort((a, b) => b.id - a.id).slice(0, 5).map((p) => {
                
                const presupuesto = p.presupuesto_total || 0;
                
                // --- Lógica de cálculo (sin cambios) ---
                const rendiciones_del_proyecto = rendiciones.filter(r => r.proyecto === p.id);
                const rendido = rendiciones_del_proyecto.reduce((acc, r) => acc + (parseFloat(r.monto_rendido) || 0), 0);
                const porcentaje = presupuesto > 0 ? Math.round((rendido / presupuesto) * 100) : 0;
                // ------------------------------------

                return (
                  // --- CAMBIO DAISYUI: Cada proyecto es un div simple ---
                  <div key={p.id} className="p-4 rounded-lg bg-base-200 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{p.nombre || 'Sin datos aún'}</div>
                      
                      {/* --- CAMBIO DAISYUI: Badge --- */}
                      <div className={`badge ${
                        p.estado === 'Aprobado' ? 'badge-success' : 
                        p.estado === 'Rechazado' ? 'badge-primary' : 'badge-primary'
                      }`}>
                        {p.estado === 'Borrador' ? 'Pendiente de validación' : p.estado}
                      </div>
                      
                    </div>
                    
                    {/* --- CAMBIO DAISYUI: text-base-content/70 --- */}
                    <div className="text-sm text-base-content/70">Presupuesto: {formatMonto(presupuesto)}</div>
                    <div className="text-sm text-base-content/70">Rendido: {formatMonto(rendido)}</div>

                    {/* --- CAMBIO DAISYUI: Progress Bar --- */}
                    <progress className="progress progress-primary w-full" value={porcentaje} max="100"></progress>
                    
                    <div className="text-right text-xs font-bold">{porcentaje}% Rendido</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-4">Sin datos aún</div>
          )}
        </div>
      </div>
      {/* ------------------------------------ */}
    </div>
  );
}