import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TablaGenerica from '../components/TablaGenerica';
import { apiFetch } from '../utils/api';

function formatFechaCL(fecha) {
  if (!fecha || typeof fecha !== 'string' || !fecha.includes('-')) return '';
  const parts = fecha.split('T')[0].split('-');
  if (parts.length !== 3) return fecha;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function formatMonto(monto) {
  if (monto === undefined || monto === null || isNaN(monto)) return '$0';
  return '$' + Number(monto).toLocaleString('es-CL', { maximumFractionDigits: 0 });
}

export default function Rendiciones() {
  const [rendiciones, setRendiciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    proyecto: '',
    documento: null,
    monto_rendido: '',
    descripcion: '',
    fecha_rendicion: '',
  });
  const [proyectos, setProyectos] = useState([]);
  const [comunidadId, setComunidadId] = useState(null);
  const [periodoVigente, setPeriodoVigente] = useState(null);
  const [showNoPeriodoModal, setShowNoPeriodoModal] = useState(false);
  const navigate = useNavigate();

  const fetchRendiciones = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/rendiciones/');
      const data = res.ok ? await res.json() : [];
      setRendiciones(Array.isArray(data) ? data : data.results || []);
    } catch {
      setRendiciones([]);
    }
    setLoading(false);
  }, []);
  
  useEffect(() => {
    async function fetchComunidad() {
      let comunidadFromToken = null;
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.comunidad && user.comunidad.id) {
          comunidadFromToken = user.comunidad.id;
        }
      } catch (err) { /* Silencio */ }

      try {
        const res = await apiFetch("/auth/profile/");

        if (res.ok) {
          const data = await res.json();
          let id = null;
          if (data.comunidad_id) id = data.comunidad_id;
          else if (data.comunidad) id = data.comunidad;
          else if (comunidadFromToken) id = comunidadFromToken;
          if (id) {
            setComunidadId(id);
            return id;
          }
        }
        if (comunidadFromToken) {
            setComunidadId(comunidadFromToken);
            return comunidadFromToken;
        }
        return null;
      } catch (err) {
        if (comunidadFromToken) {
            setComunidadId(comunidadFromToken);
            return comunidadFromToken;
        }
        return null;
      }
    }
    
    async function fetchPeriodoVigente(idComunidad) {
      if (!idComunidad) {
        setPeriodoVigente(null);
        return;
      }

      try {
        const res = await apiFetch("/periodos/periodos/");

        if (res.ok) {
          const data = await res.json();
          const listaPeriodos = Array.isArray(data) ? data : data.results || [];
          const hoy = new Date().toISOString().slice(0, 10);

          const vigente = listaPeriodos.find((p) => {
            const esDeMiComunidad = String(p.comunidad) === String(idComunidad);
            const fechaValida = p.fecha_inicio <= hoy && p.fecha_fin >= hoy;
            return esDeMiComunidad && fechaValida;
          });

          if (vigente) {
            setPeriodoVigente(vigente);
          } else {
            setPeriodoVigente(null);
            setShowNoPeriodoModal(true); 
          }
        }
      } catch (err) {
        setPeriodoVigente(null);
      }
    }
    
    async function fetchProyectosData() {
        try {
            const res = await apiFetch('/proyectos/');
            const data = res.ok ? await res.json() : [];
            setProyectos(Array.isArray(data) ? data : data.results || []);
        } catch {
            setProyectos([]);
        }
    }
    
    async function cargarDatosIniciales() {
      const idComunidad = await fetchComunidad();
      await fetchPeriodoVigente(idComunidad); 
      await fetchRendiciones(); 
      await fetchProyectosData(); 
    }

    cargarDatosIniciales();
  }, [fetchRendiciones]);
  
  const handleShowForm = () => {
    if (!periodoVigente) {
      setShowNoPeriodoModal(true); 
    } else {
      setShowForm(true); 
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true); 
    
    if (!periodoVigente) {
        setShowNoPeriodoModal(true);
        setFormLoading(false); 
        return;
    }

    const docForm = new FormData();
    docForm.append('archivo', form.documento);
    docForm.append('nombre', form.documento.name);
    docForm.append('tipo', 'rendicion');
    docForm.append('descripcion', form.descripcion);

    let docData;
    try {
      const docRes = await apiFetch('/documentos/', {
        method: 'POST',
        body: docForm
      });
      docData = await docRes.json();
      if (!docRes.ok) {
        throw new Error('Error al subir el documento: ' + JSON.stringify(docData));
      }
    } catch (err) {
      alert(err.message);
      setFormLoading(false); 
      return;
    }
    
    const documentoId = docData.id;

    const rendicionPayload = {
      proyecto: form.proyecto,
      monto_rendido: form.monto_rendido,
      descripcion: form.descripcion,
      fecha_rendicion: form.fecha_rendicion,
      documentos_ids: [documentoId]
    };

    try {
      const res = await apiFetch('/rendiciones/', {
        method: 'POST',
        body: JSON.stringify(rendicionPayload)
      });
      
      const resText = await res.text();
      if (!res.ok) {
        try {
            const errJson = JSON.parse(resText);
            alert('Error al guardar la rendición: ' + JSON.stringify(errJson));
        } catch {
            alert('Error al guardar la rendición: ' + resText);
        }
        setFormLoading(false); 
        return;
      }

      fetchRendiciones(); 
      setShowForm(false);
      setForm({ proyecto: '', documento: null, monto_rendido: '', descripcion: '', fecha_rendicion: '' });

    } catch (err) {
      alert(err.message);
    }
    setFormLoading(false); 
  };

  const columns = [
    { key: 'proyecto', label: 'Proyecto' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'monto', label: 'Monto' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'documento', label: 'Documento' },
  ];

  const dataParaTabla = rendiciones.map(r => ({
    proyecto: r.proyecto_nombre || '...',
    descripcion: r.descripcion,
    monto: formatMonto(r.monto_rendido),
    fecha: formatFechaCL(r.fecha_rendicion),
    documento: (
      r.documentos_adjuntos && r.documentos_adjuntos.length > 0 ? (
        r.documentos_adjuntos.map(doc => (
            <a 
              key={doc.id}
              href={doc.archivo} 
              download 
              target="_blank" 
              rel="noopener noreferrer" 
              title={doc.nombre}
              className="btn btn-outline btn-xs"
            >
              Ver PDF
            </a>
        ))
      ) : (
        <span>-</span>
      )
    )
  }));

  return (
    <div className="space-y-6">
      
      <dialog className={`modal ${showNoPeriodoModal ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error">Atención</h3>
          <p className="py-4 text-base-content/80">
            No se encontró un Periodo activo para su comunidad.
            <br />
            Debe crear un periodo antes de poder gestionar proyectos.
          </p>
          <div className="modal-action">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/crear-periodo")}
            >
              Crear Periodo
            </button>
          </div>
        </div>
      </dialog>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-box bg-base-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-primary">Gestión de Rendiciones</h2>
          <p className="text-base-content/70">
            Carga y justificación de gastos del proyecto.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleShowForm}>
          Crear Rendición
        </button>
      </div>

      <dialog className={`modal ${showForm ? "modal-open" : ""}`}>
        <div className="modal-box w-11/12 max-w-2xl">
          <h3 className="font-bold text-lg text-primary">Nueva Rendición</h3>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            
            <div className="form-control">
              <label className="label"><span className="label-text">Proyecto</span></label>
              <select className="select select-bordered" required value={form.proyecto} onChange={e => setForm(f => ({ ...f, proyecto: e.target.value }))}>
                <option value="">Selecciona un proyecto</option>
                {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Documento PDF (Factura/Boleta)</span></label>
              <input
                className="file-input file-input-bordered w-full"
                type="file"
                accept="application/pdf"
                required
                onChange={e => setForm(f => ({ ...f, documento: e.target.files[0] }))}
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Monto Rendido</span></label>
              <div className="input-group">
                <span>$</span>
                <input className="input input-bordered w-full" type="number" required value={form.monto_rendido} onChange={e => setForm(f => ({ ...f, monto_rendido: e.target.value }))} />
              </div>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Descripción</span></label>
              <textarea className="textarea textarea-bordered w-full" required value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Fecha de Rendición</span></label>
              <input className="input input-bordered w-full" type="date" required value={form.fecha_rendicion} onChange={e => setForm(f => ({ ...f, fecha_rendicion: e.target.value }))} />
            </div>

            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn btn-primary" type="submit" disabled={formLoading}>
                {formLoading && <span className="loading loading-spinner"></span>}
                {formLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {loading ? (
        <div className="text-center p-12">
          <span className="loading loading-lg loading-spinner text-primary"></span>
        </div>
      ) : (
        <TablaGenerica
          columns={columns}
          data={dataParaTabla}
          emptyText="No hay rendiciones registradas."
          rowsPerPage={8}
        />
      )}
    </div>
  );
}