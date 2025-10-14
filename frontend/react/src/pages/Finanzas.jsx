import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import '../index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';

// jQuery + DataTables
import $ from 'jquery';
import 'datatables.net-bs5';

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const formatMoney = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

const Finanzas = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch APIs
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [movRes, gasRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/movimientos/'),
          axios.get('http://127.0.0.1:8000/api/gastos/'),
        ]);

        setMovimientos(Array.isArray(movRes.data) ? movRes.data : (movRes.data?.results ?? []));
        setGastos(Array.isArray(gasRes.data) ? gasRes.data : (gasRes.data?.results ?? []));
      } catch (err) {
        console.error('Error cargando finanzas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // KPIs (tolerantes al esquema)
  const {
    totalMovs,
    ingresosAmount,
    egresosAmount,
    saldo,
    gastosAmount,
  } = useMemo(() => {
    const totalMovs = movimientos.length;

    // Intentar inferir ingresos/egresos desde "tipo", "es_ingreso" o signo del monto
    let ingresos = 0;
    let egresos = 0;
    movimientos.forEach((m) => {
      const monto = toNumber(m.monto ?? m.importe ?? 0);

      const tipo = (m.tipo ?? m.category ?? '').toString().toLowerCase();
      const esIngreso =
        tipo.includes('ingreso') ||
        m.es_ingreso === true ||
        (!tipo && monto > 0);
      const esEgreso =
        tipo.includes('egreso') ||
        m.es_ingreso === false ||
        (!tipo && monto < 0);

      if (esIngreso) ingresos += Math.abs(monto);
      else if (esEgreso) egresos += Math.abs(monto);
      else {
        // Si no podemos inferir, asumimos positivo como ingreso
        if (monto >= 0) ingresos += monto;
        else egresos += Math.abs(monto);
      }
    });

    // También calculamos el total de gastos desde /gastos/
    const gastosAmount = gastos.reduce((acc, g) => acc + toNumber(g.monto ?? g.importe ?? 0), 0);

    // Saldo: preferimos egresos de movimientos; si no, usamos gastos
    const egresosTotales = egresos || gastosAmount;
    const saldo = ingresos - egresosTotales;

    return {
      totalMovs,
      ingresosAmount: ingresos,
      egresosAmount: egresosTotales,
      saldo,
      gastosAmount,
    };
  }, [movimientos, gastos]);

  // DataTables init/destroy
  useEffect(() => {
    if (!loading) {
      // MOVIMIENTOS
      if ($.fn.dataTable.isDataTable('#movimientosTable')) {
        $('#movimientosTable').DataTable().destroy();
      }
      $('#movimientosTable').DataTable({
        language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json' },
      });

      // GASTOS
      if ($.fn.dataTable.isDataTable('#gastosTable')) {
        $('#gastosTable').DataTable().destroy();
      }
      $('#gastosTable').DataTable({
        language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json' },
      });
    }
  }, [loading, movimientos, gastos]);

  if (loading) return <div>Cargando finanzas…</div>;

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 text-dark">Finanzas</h1>
          <p className="text-muted">Resumen de movimientos e indicadores financieros.</p>
        </div>
      </div>

      {/* KPIs (misma gramática que Dashboard) */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="dashboard-card">
            <div className="dashboard-card-title">Total Movimientos</div>
            <div className="dashboard-card-content">{totalMovs}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="dashboard-card">
            <div className="dashboard-card-title">Total Ingresos</div>
            <div className="dashboard-card-content text-success">{formatMoney(ingresosAmount)}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="dashboard-card">
            <div className="dashboard-card-title">Total Gastos</div>
            <div className="dashboard-card-content text-danger">
              {formatMoney(egresosAmount || gastosAmount)}
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="dashboard-card">
            <div className="dashboard-card-title">Saldo</div>
            <div className={`dashboard-card-content ${saldo >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatMoney(saldo)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla: Movimientos */}
      <div className="dashboard-card dashboard-card-nohover" style={{ marginTop: 24 }}>
        <div className="dashboard-card-title">Movimientos</div>
        <div className="dashboard-card-content2">
          <div className="table-responsive">
            <table id="movimientosTable" className="table table-striped table-hover align-middle">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Monto</th>
                  <th>Proyecto</th>
                  <th>Comunidad</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m, i) => {
                  const fecha =
                    m.fecha ?? m.fecha_movimiento ?? (m.created_at ? String(m.created_at).slice(0, 10) : '—');
                  const tipoRaw = (m.tipo ?? m.category ?? '').toString();
                  const esIngreso =
                    tipoRaw.toLowerCase().includes('ingreso') ||
                    m.es_ingreso === true ||
                    toNumber(m.monto ?? m.importe ?? 0) >= 0;
                  const tipo = esIngreso ? 'Ingreso' : 'Egreso';
                  const monto = toNumber(m.monto ?? m.importe ?? 0);
                  const proyecto = m.proyecto_nombre ?? m.proyecto ?? '—';
                  const comunidad = m.comunidad_nombre ?? m.comunidad ?? '—';
                  const desc = m.descripcion ?? m.detalle ?? '—';
                  const estado = m.estado ?? '—';

                  return (
                    <tr key={`mov-${m.id ?? i}`}>
                      <td>{fecha}</td>
                      <td>
                        <span className={`badge ${esIngreso ? 'bg-success' : 'bg-danger'}`}>{tipo}</span>
                      </td>
                      <td className={esIngreso ? 'text-success' : 'text-danger'}>
                        {formatMoney(Math.abs(monto))}
                      </td>
                      <td>{proyecto}</td>
                      <td>{comunidad}</td>
                      <td className="text-muted">{desc}</td>
                      <td>{estado}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tabla: Gastos */}
      <div className="dashboard-card dashboard-card-nohover" style={{ marginTop: 24 }}>
        <div className="dashboard-card-title">Gastos</div>
        <div className="dashboard-card-content2">
          <div className="table-responsive">
            <table id="gastosTable" className="table table-striped table-hover align-middle">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Proyecto</th>
                  <th>Comunidad</th>
                  <th>Categoría</th>
                  <th>Monto</th>
                  <th>Documento</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((g, i) => {
                  const fecha =
                    g.fecha ?? g.fecha_gasto ?? (g.created_at ? String(g.created_at).slice(0, 10) : '—');
                  const proyecto = g.proyecto_nombre ?? g.proyecto ?? '—';
                  const comunidad = g.comunidad_nombre ?? g.comunidad ?? '—';
                  const categoria = g.categoria ?? g.tipo ?? '—';
                  const monto = toNumber(g.monto ?? g.importe ?? 0);
                  const doc = g.documento ?? g.comprobante ?? '—';
                  const estado = g.estado ?? '—';

                  return (
                    <tr key={`gas-${g.id ?? i}`}>
                      <td>{fecha}</td>
                      <td>{proyecto}</td>
                      <td>{comunidad}</td>
                      <td>{categoria}</td>
                      <td className="text-danger">{formatMoney(monto)}</td>
                      <td className="text-muted">{doc}</td>
                      <td>{estado}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finanzas;
