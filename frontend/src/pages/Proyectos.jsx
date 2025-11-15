import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TablaGenerica from "../components/TablaGenerica";

function formatMonto(monto) {
  if (monto === undefined || monto === null || isNaN(monto)) return "$0";
  return "$" + Number(monto).toLocaleString("es-CL", { maximumFractionDigits: 0 });
}

function formatFechaCL(fecha) {
  if (!fecha || typeof fecha !== "string" || !fecha.includes("-")) return "";
  const parts = fecha.split("T")[0].split("-");
  if (parts.length !== 3) return fecha;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  // --- CORRECCIÓN 1: Añadir estado para las rendiciones ---
  const [rendiciones, setRendiciones] = useState([]);
  // ----------------------------------------------------
  const [loading, setLoading] = useState(true);
  const [etapa, setEtapa] = useState(0);
  const [nuevoProyecto, setNuevoProyecto] = useState({
    nombre: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    presupuesto_total: "",
    documentos: { asamblea: null, cotizaciones: null, elegido: null },
  });
  const [comunidadId, setComunidadId] = useState(null);
  const [periodoVigente, setPeriodoVigente] = useState(null);
  const [showNoPeriodoModal, setShowNoPeriodoModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const navigate = useNavigate();

  let isAuditor = false;
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    isAuditor = user && (user.rol === "auditor" || user.role === "auditor");
  } catch (err) { /* Silencio */ }

  const fetchProyectos = useCallback(async () => {
    // ... tu fetchProyectos ...
     const token = localStorage.getItem("access");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/proyectos/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = [];
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (err) {
        data = [];
      }
      setProyectos(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setProyectos([]);
    }
    setLoading(false);
  }, [setProyectos, setLoading]);

  // --- CORRECCIÓN 2: Crear un fetch para Rendiciones ---
  const fetchRendiciones = useCallback(async () => {
    const token = localStorage.getItem("access");
    try {
      const res = await fetch("http://localhost:8000/api/rendiciones/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = await res.json();
      setRendiciones(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setRendiciones([]);
    }
  }, [setRendiciones]);
  // ----------------------------------------------------

  useEffect(() => {
    const token = localStorage.getItem("access");

    async function fetchComunidad() {
      // ... tu lógica de fetchComunidad ...
       let comunidadFromToken = null;
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.comunidad && user.comunidad.id) {
          comunidadFromToken = user.comunidad.id;
        }
      } catch (err) { /* Silencio */ }

      try {
        const res = await fetch("http://localhost:8000/api/auth/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          let id = null;
          if (data.comunidad_id) id = data.comunidad_id;
          else if (data.comunidad) id = data.comunidad;
          else if (comunidadFromToken) id = comunidadFromToken;

          if (id) {
            setComunidadId(id);
            return id;
          } else {
            setComunidadId(null);
            return null;
          }
        } else {
          if (comunidadFromToken) {
            setComunidadId(comunidadFromToken);
            return comunidadFromToken;
          }
          setComunidadId(null);
          return null;
        }
      } catch (err) {
        if (comunidadFromToken) {
          setComunidadId(comunidadFromToken);
          return comunidadFromToken;
        }
        setComunidadId(null);
        return null;
      }
    }

    async function fetchPeriodoVigente(idComunidad) {
      // ... tu lógica de fetchPeriodoVigente ...
       if (!idComunidad) {
        setPeriodoVigente(null);
        return;
      }

      try {
        const res = await fetch(
          "http://localhost:8000/api/periodos/periodos/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

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
        } else {
          console.error("Error al obtener periodos:", res.status);
        }
      } catch (err) {
        console.error("Error de red en fetchPeriodoVigente:", err);
        setPeriodoVigente(null);
      }
    }

    async function cargarDatosIniciales() {
      const idComunidad = await fetchComunidad();
      await fetchPeriodoVigente(idComunidad);
      await fetchProyectos();
      await fetchRendiciones(); // <-- Llamar al nuevo fetch
    }

    cargarDatosIniciales();
  }, [fetchProyectos, fetchRendiciones]); // <-- Añadir fetchRendiciones

  // ... (toda tu lógica de handleInputChange, handleFileChange, handleCrearProyecto) ...
    const handleInputChange = (e) => {
    setNuevoProyecto({ ...nuevoProyecto, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e) => {
    setNuevoProyecto({
      ...nuevoProyecto,
      documentos: {
        ...nuevoProyecto.documentos,
        [e.target.name]: e.target.files[0],
      },
    });
  };
  
  const handleCrearProyecto = async (e) => {
    e.preventDefault();
    setFormLoading(true); // Activar loading del formulario
    const token = localStorage.getItem("access");
    if (!comunidadId) {
      alert("No se pudo obtener la comunidad del usuario.");
      setFormLoading(false);
      return;
    }
    if (!periodoVigente || !periodoVigente.id) {
      setShowNoPeriodoModal(true);
      setFormLoading(false);
      return;
    }
    
    // (Tu lógica de FormData está perfecta)
    const presupuestoFormateado = Number(
      nuevoProyecto.presupuesto_total
    ).toFixed(2);
    const formData = new FormData();
    formData.append("nombre", nuevoProyecto.nombre);
    formData.append("descripcion", nuevoProyecto.descripcion);
    formData.append("periodo", periodoVigente.id);
    formData.append("fecha_inicio", nuevoProyecto.fecha_inicio);
    formData.append("fecha_fin", nuevoProyecto.fecha_fin);
    formData.append("presupuesto_total", presupuestoFormateado);
    formData.append("estado", "Borrador"); // Estado por defecto
    formData.append("estado_rendicion", "Pendiente"); // Estado por defecto
    formData.append("comunidad", comunidadId);
    if (nuevoProyecto.documentos.asamblea) {
      formData.append("acta", nuevoProyecto.documentos.asamblea);
    }
    if (nuevoProyecto.documentos.cotizaciones) {
      formData.append("cotizaciones", nuevoProyecto.documentos.cotizaciones);
    }
    if (nuevoProyecto.documentos.elegido) {
      formData.append("elegido", nuevoProyecto.documentos.elegido);
    }

    try {
      const res = await fetch("http://localhost:8000/api/proyectos/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const text = await res.text();
      if (res.ok) {
        setEtapa(0); // Ocultar formulario
        fetchProyectos();
        // Limpiar formulario
        setNuevoProyecto({
          nombre: "", descripcion: "", fecha_inicio: "", fecha_fin: "",
          presupuesto_total: "",
          documentos: { asamblea: null, cotizaciones: null, elegido: null },
        });
      } else {
        alert("Error al crear el proyecto: " + text);
      }
    } catch (err) {
      alert("Error de red al crear el proyecto: " + err.message);
    }
    setFormLoading(false); // Desactivar loading del formulario
  };


  const columns = [
    { key: "nombre", label: "Proyecto" },
    { key: "fechas", label: "Fechas" },
    { key: "presupuesto", label: "Presupuesto" },
    { key: "rendido", label: "Rendido" },
    { key: "estado", label: "Estado" },
    { key: "documentos", label: "Documentos" },
  ];

  // --- CORRECCIÓN 3: Mapeo de datos para TablaGenerica ---
  const dataParaTabla = proyectos.map((p) => {
    const presupuesto = p.presupuesto_total || 0;
    
    // --- ¡AQUÍ ESTÁ LA LÓGICA DE DASHBOARD.JSX! ---
    const rendiciones_del_proyecto = rendiciones.filter(r => r.proyecto === p.id);
    const montoRendido = rendiciones_del_proyecto.reduce((acc, r) => acc + (parseFloat(r.monto_rendido) || 0), 0);
    // ------------------------------------------------
    
    const faltaPorRendir = Number(presupuesto) - Number(montoRendido);

    return {
      nombre: (
        <div>
          <div className="font-bold">{p.nombre}</div>
          <div className="text-sm opacity-70">{p.estado_rendicion}</div>
        </div>
      ),
      fechas: (
        <div>
          <div>Inicio: {formatFechaCL(p.fecha_inicio)}</div>
          <div>Fin: {formatFechaCL(p.fecha_fin)}</div>
        </div>
      ),
      presupuesto: (
        <div>
          <div>{formatMonto(presupuesto)}</div>
          <div className="text-xs opacity-70">Faltan {formatMonto(faltaPorRendir)}</div>
        </div>
      ),
      rendido: ( // <-- Ahora 'montoRendido' es el valor calculado
        <div>
          <div>{formatMonto(montoRendido)}</div>
          <progress className="progress progress-primary w-20" value={montoRendido} max={presupuesto}></progress>
        </div>
      ),
      estado: (
        <div className={`badge ${
            p.estado === 'Aprobado' || p.estado === 'Validado' ? 'badge-success' : 
            p.estado === 'Rechazado' ? 'badge-error' : 'badge-warning'
          } badge-outline`}
        >
          {p.estado_rendicion}
        </div>
      ),
      documentos: (
        <div className="btn-group btn-group-vertical lg:btn-group-horizontal">
          {p.acta_url ? (
            <a href={p.acta_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-xs" download>Acta</a>
          ) : (
             <button className="btn btn-outline btn-xs btn-disabled">Acta</button>
          )}
          {p.cotizaciones_url ? (
            <a href={p.cotizaciones_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-xs" download>Cotiz.</a>
          ) : (
             <button className="btn btn-outline btn-xs btn-disabled">Cotiz.</button>
          )}
          {p.elegido_url ? (
            <a href={p.elegido_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-xs" download>Elegido</a>
          ) : (
             <button className="btn btn-outline btn-xs btn-disabled">Elegido</button>
          )}
        </div>
      ),
    };
  });


  return (
    // --- TU JSX (Modal, Formulario, TablaGenerica) ESTÁ PERFECTO ---
    // --- NO SE MODIFICA ---
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
              Ir a Crear Periodo
            </button>
          </div>
        </div>
      </dialog>

<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 p-4 rounded-box bg-base-200 shadow-sm">
  <div>
    <h2 className="text-2xl font-bold text-primary">Gestión de Proyectos</h2>
          <p className="text-base-content/70">
            Creación, seguimiento y rendición de proyectos comunitarios
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setEtapa(etapa === 1 ? 0 : 1)} // <-- Toggle para abrir/cerrar
        >
          {etapa === 1 ? "Cerrar Formulario" : "Crear Proyecto"}
        </button>
      </div>
      
      {etapa === 1 && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <form onSubmit={handleCrearProyecto} className="space-y-4">
              <h3 className="text-lg font-bold text-primary mb-2">
                Etapa 1: Creación de Proyecto
              </h3>
              
              <div className="form-control">
                <label className="label"><span className="label-text">Nombre del Proyecto</span></label>
                <input
                  type="text" name="nombre" value={nuevoProyecto.nombre}
                  onChange={handleInputChange} className="input input-bordered w-full" required
                />
              </div>
              
              <div className="form-control">
                <label className="label"><span className="label-text">Descripción</span></label>
                <textarea
                  name="descripcion" value={nuevoProyecto.descripcion}
                  onChange={handleInputChange} className="textarea textarea-bordered w-full" required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Fecha Inicio</span></label>
                  <input
                    type="date" name="fecha_inicio" value={nuevoProyecto.fecha_inicio}
                    onChange={handleInputChange} className="input input-bordered w-full" required
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Fecha Fin</span></label>
                  <input
                    type="date" name="fecha_fin" value={nuevoProyecto.fecha_fin}
                    onChange={handleInputChange} className="input input-bordered w-full" required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Presupuesto Total</span></label>
                <div className="input-group">
                  <span>$</span>
                  <input
                    type="number" name="presupuesto_total" value={nuevoProyecto.presupuesto_total}
                    onChange={handleInputChange} className="input input-bordered w-full" required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Acta de Asamblea</span></label>
                  <input
                    type="file" name="asamblea" onChange={handleFileChange}
                    className="file-input file-input-bordered file-input-sm w-full" required
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Cotizaciones</span></label>
                  <input
                    type="file" name="cotizaciones" onChange={handleFileChange}
                    className="file-input file-input-bordered file-input-sm w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Elegido</span></label>
                  <input
                    type="file" name="elegido" onChange={handleFileChange}
                    className="file-input file-input-bordered file-input-sm w-full"
                  />
                </div>
              </div>
              
              <div className="card-actions justify-end">
                <button type="button" className="btn btn-ghost" onClick={() => setEtapa(0)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading && <span className="loading loading-spinner"></span>}
                  {formLoading ? 'Creando...' : 'Crear Proyecto'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2">
          Proyectos existentes
        </h3>
        {loading ? (
          <div className="text-center p-12">
            <span className="loading loading-lg loading-spinner text-primary"></span>
          </div>
        ) : (
          <TablaGenerica
            columns={columns}
            data={dataParaTabla}
            emptyText="No hay proyectos registrados para su comunidad"
            rowsPerPage={5}
          />
        )}
      </div>
    </div>
  );
}