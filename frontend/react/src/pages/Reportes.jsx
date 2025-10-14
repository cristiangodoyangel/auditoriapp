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

const Reportes = () => {
  const [proyectos, setProyectos] = useState([]);
  const [comunidades, setComunidades] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [gastos, setGastos] = useState([]);

  const [loading, setLoading] = useState(true);

  // Filtros
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [comunidadSel, setComunidadSel] = useState('');
  const [proyectoSel, setProyectoSel] = useState('');

  // Fetch APIs base del router que mostraste
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pr, co, mo, ga] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/proyectos/'),
          axios.get('http://127.0.0.1:8000/api/comunidades/'),
          axios.get('http://127.0.0.1:8000/api/movimientos/'),
          axios.get('http://127.0.0.1:8000/api/gastos/'),
        ]);
        setProyectos(Array.isArray(pr.data) ? pr.data : (pr.data?.results ?? []));
        setComunidades(Array.isArray(co.data) ? co.data : (co.data?.results ?? []));
        setMovimientos(Array.isArray(mo.data) ? mo.data : (mo.data?.results ?? []));
        setGastos(Array.isArray(ga.data) ? ga.data : (ga.data?.results ?? []));
      } catch (err) {
        console.error('Error cargando datos para reportes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Helpers de filtro
  const inRange = (fechaStr) => {
    if (!fechaStr) return true;
    const f = new Date(fechaStr);
    if (Number.isNaN(+f)) return true;
    const d = fechaDesde ? new Date(fechaDesde) : null;
    const h = fechaHasta ? new Date(fechaHasta) : null;
    if (d && f < d) return false;
    if (h && f > h) return false;
    return true;
  };

  const matchComunidad = (value) =>
    !comunidadSel ||
    String(value) === String(comunidadSel) ||
    String(value?.id ?? '') === String(comunidadSel) ||
    String(value?.nombre ?? value).toLowerCase().includes(String(comunidadSel).toLowerCase());

  const matchProyecto = (value) =>
    !proyectoSel ||
    String(value) === String(proyectoSel) ||
    String(value?.id ?? '') === String(proyectoSel) ||
    String(value?.nombre ?? value).toLowerCase().includes(String(proyectoSel).toLowerCase());

  // Aplicar filtros en cliente
  const movsFiltrados = useMemo(() => {
    return movimientos.filter((m) => {
      const fecha = m.fecha ?? m.fecha_movimiento ?? m.created_at ?? '';
      const comunidad = m.comunidad ?? m.comunidad_nombre ?? '';
      const proyecto = m.proyecto ?? m.proyecto_nombre ?? '';
      return inRange(String(fecha).slice(0, 10)) && matchComunidad(comunidad) && matchProyecto(proyecto);
    });
  }, [movimientos, fechaDesde, fechaHasta, comunidadSel, proyectoSel]);

  const gastosFiltrados = useMemo(() => {
    return gastos.filter((g) => {
      const fecha = g.fecha ?? g.fecha_gasto ?? g.created_at ?? '';
      const comunidad = g.comunidad ?? g.comunidad_nombre ?? '';
      const proyecto = g.proyecto ?? g.proyecto_nombre ?? '';
      return inRange(String(fecha).slice(0, 10)) && matchComunidad(comunidad) && matchProyecto(proyecto);
    });
  }, [gastos, fechaDesde, fechaHasta, comunidadSel, proyectoSel]);

  // Totales
  const totalMovs = movsFiltrados.length;
  const totalMovsMonto = movsFiltrados.reduce((acc, m) => acc + toNumber(m.monto ?? m.importe ?? 0), 0);

  const totalGastos = gastosFiltrados.length;
  const totalGastosMonto = gastosFiltrados.reduce((acc, g) => acc + toNumber(g.monto ?? g.importe ?? 0), 0);

  // DataTables init/destroy cuando cambian datasets filtrados
  useEffect(() => {
    if (!loading) {
      if ($.fn.dataTable.isDataTable('#reporteMovsTable')) {
        $('#reporteMovsTable').DataTable().destroy();
      }
      $('#reporteMovsTable').DataTable({
        language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json' },
      });

      if ($.fn.dataTable.isDataTable('#reporteGastosTable')) {
        $('#reporteGastosTable').DataTable().destroy();
      }
      $('#reporteGastosTable').DataTable({
        language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json' },
      });
    }
  }, [loading, movsFiltrados, gastosFiltrados]);

  if (loading) return <div>Cargando reportes…</div>;

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 text-dark">Reportes</h1>
          <p className="text-muted">Filtra y exporta la información financiera y operativa.</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="dashboard-card" style={{ marginBottom: 24 }}>
        <div className="dashboard-card-title">Filtros</div>
        <div className="dashboard-card-content2">
          <div className="row g-3">
            <div className="col-12 col-md-3">
              <label className="form-label">Desde</label>
              <input
                type="date"
                className="form-control"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Hasta</label>
              <input
                type="date"
                className="form-control"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Comunidad</label>
              <select
                className="form-select"
                value={comunidadSel}
                onChange={(e) => setComunidadSel(e.target.value)}
              >
                <option value="">Todas</option>
                {comunidades.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre ?? c.name ?? `ID ${c.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Proyecto</label>
              <select
                className="form-select"
                value={proyectoSel}
                onChange={(e) => setProyectoSel(e.target.value)}
              >
                <option value="">Todos</option>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre ?? `Proyecto ${p.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="dashboard-card">
            <div className="dashboard-card-title">Movimientos (registros)</div>
            <div className="dashboard-card-content">{totalMovs}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="dashboard-card">
            <div className="dashboard-card-title">Movimientos (monto)</div>
            <div className="dashboard-card-content">{formatMoney(totalMovsMonto)}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="dashboard-card">
            <div className="dashboard-card-title">Gastos (registros)</div>
            <div className="dashboard-card-content">{totalGastos}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="dashboard-card">
            <div className="dashboard-card-title">Gastos (monto)</div>
            <div className="dashboard-card-content text-danger">{formatMoney(totalGastosMonto)}</div>
          </div>
        </div>
      </div>

      {/* Reporte: Movimientos */}
      <div className="dashboard-card dashboard-card-nohover" style={{ marginTop: 24 }}>
        <div className="dashboard-card-title">Reporte de Movimientos</div>
        <div className="dashboard-card-content2">
          <div className="table-responsive">
            <table id="reporteMovsTable" className="table table-striped table-hover align-middle">
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
                {movsFiltrados.map((m, i) => {
                  const fecha = (m.fecha ?? m.fecha_movimiento ?? m.created_at ?? '').toString().slice(0, 10);
                  const tipoRaw = (m.tipo ?? m.category ?? '').toString().toLowerCase();
                  const monto = toNumber(m.monto ?? m.importe ?? 0);
                  const esIngreso = tipoRaw.includes('ingreso') || m.es_ingreso === true || monto >= 0;
                  return (
                    <tr key={`rm-${m.id ?? i}`}>
                      <td>{fecha || '—'}</td>
                      <td>
                        <span className={`badge ${esIngreso ? 'bg-success' : 'bg-danger'}`}>
                          {esIngreso ? 'Ingreso' : 'Egreso'}
                        </span>
                      </td>
                      <td className={esIngreso ? 'text-success' : 'text-danger'}>{formatMoney(Math.abs(monto))}</td>
                      <td>{m.proyecto_nombre ?? m.proyecto ?? '—'}</td>
                      <td>{m.comunidad_nombre ?? m.comunidad ?? '—'}</td>
                      <td className="text-muted">{m.descripcion ?? m.detalle ?? '—'}</td>
                      <td>{m.estado ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reporte: Gastos */}
      <div className="dashboard-card dashboard-card-nohover" style={{ marginTop: 24 }}>
        <div className="dashboard-card-title">Reporte de Gastos</div>
        <div className="dashboard-card-content2">
          <div className="table-responsive">
            <table id="reporteGastosTable" className="table table-striped table-hover align-middle">
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
                {gastosFiltrados.map((g, i) => {
                  const fecha = (g.fecha ?? g.fecha_gasto ?? g.created_at ?? '').toString().slice(0, 10);
                  const monto = toNumber(g.monto ?? g.importe ?? 0);
                  return (
                    <tr key={`rg-${g.id ?? i}`}>
                      <td>{fecha || '—'}</td>
                      <td>{g.proyecto_nombre ?? g.proyecto ?? '—'}</td>
                      <td>{g.comunidad_nombre ?? g.comunidad ?? '—'}</td>
                      <td>{g.categoria ?? g.tipo ?? '—'}</td>
                      <td className="text-danger">{formatMoney(monto)}</td>
                      <td className="text-muted">{g.documento ?? g.comprobante ?? '—'}</td>
                      <td>{g.estado ?? '—'}</td>
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

export default Reportes;
