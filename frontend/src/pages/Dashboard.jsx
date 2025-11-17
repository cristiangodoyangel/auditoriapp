import React, { useEffect, useState } from 'react';

function formatMonto(monto) {
  if (monto === undefined || monto === null || isNaN(monto)) return '$0';
  return '$' + Number(monto).toLocaleString('es-CL', { maximumFractionDigits: 0 });
}

export default function Dashboard() {
  const [proyectos, setProyectos] = useState([]);
  const [rendiciones, setRendiciones] = useState([]);
  const [periodos, setPeriodos] = useState([]);
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
      fetch('http://localhost:8000/api/rendiciones/', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.ok ? res.json() : []),
      fetch('http://localhost:8000/api/periodos/periodos/', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.ok ? res.json() : [])
    ]).then(([proy, rends, pers]) => {
      setProyectos(Array.isArray(proy) ? proy : proy.results || []);
      setRendiciones(Array.isArray(rends) ? rends : rends.results || []);
      setPeriodos(Array.isArray(pers) ? pers : pers.results || []);
      setLoading(false);
    }).catch(() => {
      setProyectos([]);
      setRendiciones([]);
      setPeriodos([]);
      setLoading(false);
    });
  }, []);

  if (isAuditor) {
    return (
      <div className="space-y-8">
        <h2>Vista de Auditor</h2>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col items-center text-center md:flex-row md:text-left md:justify-between gap-4 p-6 rounded-box bg-base-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-primary">ESTADO ACTUAL</h2>
          <p className="text-base-content/70">
            Resumen de montos y proyectos
          </p>
        </div>
      </div>
      
      <div className="stats stats-vertical md:stats-horizontal shadow w-full bg-base-200">
        
        <div className="stat place-items-center">
          <div className="stat-title text-center">Monto Asignado</div>
          <div className="stat-value text-primary text-3xl md:text-4xl">{loading ? "..." : formatMonto(montoAsignado)}</div>
          <div className="stat-desc text-center">Total de fondos del periodo</div>
        </div>
        
        <div className="stat place-items-center">
          <div className="stat-title text-center">Monto Rendido</div>
          <div className="stat-value text-primary text-3xl md:text-4xl">{loading ? "..." : formatMonto(montoRendido)}</div>
          <div className="stat-desc text-center">Total gastado y justificado</div>
        </div>
        
        <div className="stat place-items-center">
          <div className="stat-title text-center">Monto por Rendir</div>
          <div className="stat-value text-warning text-3xl md:text-4xl">{loading ? "..." : formatMonto(montoPorRendir)}</div>
          <div className="stat-desc text-center">Saldo restante</div>
        </div>
        
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="stat bg-base-200 shadow rounded-box place-items-center p-4">
          <div className="stat-title text-sm">Totales</div>
          <div className="stat-value text-2xl">{loading ? "..." : totalProyectos}</div>
          <div className="stat-desc text-xs">Proyectos</div>
        </div>
        
        <div className="stat bg-base-200 shadow rounded-box place-items-center p-4">
          <div className="stat-title text-sm text-warning">Pendientes</div>
          <div className="stat-value text-warning text-2xl">{loading ? "..." : proyectosPendientes}</div>
          <div className="stat-desc text-xs">Validación</div>
        </div>
        
        <div className="stat bg-base-200 shadow rounded-box place-items-center p-4">
          <div className="stat-title text-sm text-primary">Validados</div>
          <div className="stat-value text-primary text-2xl">{loading ? "..." : proyectosValidados}</div>
          <div className="stat-desc text-xs">Aprobados</div>
        </div>

        <div className="stat bg-base-200 shadow rounded-box place-items-center p-4">
          <div className="stat-title text-sm text-primary">Rechazados</div>
          <div className="stat-value text-primary text-2xl">{loading ? "..." : proyectosRechazados}</div>
          <div className="stat-desc text-xs">Corregir</div>
        </div>
        
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body p-4 md:p-8">
          <h2 className="card-title justify-center md:justify-start">Proyectos Recientes</h2>
          <p className="text-base-content/70 mb-4 text-center md:text-left">Últimos proyectos en gestión</p>

          {loading ? (
            <div className="text-center p-4">Cargando...</div>
          ) : proyectos && proyectos.length > 0 ? (
            <div className="space-y-4">
              {proyectos.sort((a, b) => b.id - a.id).slice(0, 5).map((p) => {
                
                const presupuesto = p.presupuesto_total || 0;
                const rendiciones_del_proyecto = rendiciones.filter(r => r.proyecto === p.id);
                const rendido = rendiciones_del_proyecto.reduce((acc, r) => acc + (parseFloat(r.monto_rendido) || 0), 0);
                const porcentaje = presupuesto > 0 ? Math.round((rendido / presupuesto) * 100) : 0;

                return (
                  <div key={p.id} className="p-4 rounded-lg bg-base-200 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                      <div className="font-semibold text-center sm:text-left">{p.nombre || 'Sin datos aún'}</div>
                      
                      <div className={`badge ${
                        p.estado === 'Aprobado' ? 'badge-success' : 
                        p.estado === 'Rechazado' ? 'badge-primary' : 'badge-primary'
                      }`}>
                        {p.estado === 'Borrador' ? 'Pendiente Val.' : p.estado}
                      </div>
                      
                    </div>
                    
                    <div className="flex justify-between text-sm text-base-content/70">
                      <span>Presupuesto:</span>
                      <span>{formatMonto(presupuesto)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-base-content/70">
                      <span>Rendido:</span>
                      <span>{formatMonto(rendido)}</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-100 mt-1">
                        <div 
                            className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(porcentaje, 100)}%` }}
                        ></div>
                    </div>
                    
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
    </div>
  );
}