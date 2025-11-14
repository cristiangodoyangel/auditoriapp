import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // <-- 1. IMPORTAR useNavigate

function formatMonto(monto) {
  if (monto === undefined || monto === null || isNaN(monto)) return "Sin datos";
  return Number(monto).toLocaleString("es-CL", { maximumFractionDigits: 0 });
}

function formatFechaCL(fecha) {
  if (!fecha || typeof fecha !== "string" || !fecha.includes("-")) return "";
  const parts = fecha.split("T")[0].split("-");
  if (parts.length !== 3) return fecha;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [etapa, setEtapa] = useState(0); // 0: nada, 1: crear, 2: auditor, 3: resumen
  const [nuevoProyecto, setNuevoProyecto] = useState({
    nombre: "",
    descripcion: "",
    periodo: "",
    fecha_inicio: "",
    fecha_fin: "",
    presupuesto_total: "",
    estado: "Borrador",
    estado_rendicion: "Pendiente",
    documentos: { asamblea: null, cotizaciones: null, elegido: null },
  });
  const [comunidadId, setComunidadId] = useState(null);
  const [periodoVigente, setPeriodoVigente] = useState(null);

  // --- 2. AÑADIR ESTADO Y HOOK PARA EL MODAL ---
  const [showNoPeriodoModal, setShowNoPeriodoModal] = useState(false);
  const navigate = useNavigate(); // Hook para redirigir
  // ------------------------------------------

  let isAuditor = false;
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    isAuditor = user && (user.rol === "auditor" || user.role === "auditor");
  } catch (err) {
    // Silencio intencional
  }

  const fetchProyectos = useCallback(async () => {
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

  useEffect(() => {
    const token = localStorage.getItem("access");

    async function fetchComunidad() {
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
            // --- 3. CAMBIO DE ALERT A MODAL ---
            setShowNoPeriodoModal(true);
            // ---------------------------------
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
    }

    cargarDatosIniciales();
  }, [fetchProyectos]); // (Quitamos 'navigate' de las dependencias, no es necesario)

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
    const token = localStorage.getItem("access");
    if (!comunidadId) {
      alert("No se pudo obtener la comunidad del usuario."); // (Dejamos este alert por si es un error grave)
      return;
    }
    if (!periodoVigente || !periodoVigente.id) {
      // --- 4. CAMBIO DE ALERT A MODAL ---
      setShowNoPeriodoModal(true);
      // ---------------------------------
      return;
    }
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
    formData.append("estado", nuevoProyecto.estado);
    formData.append("estado_rendicion", nuevoProyecto.estado_rendicion);
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
        setEtapa(0); // Ocultar formulario al crear
        fetchProyectos();
        setNuevoProyecto({
          nombre: "",
          descripcion: "",
          periodo: "",
          fecha_inicio: "",
          fecha_fin: "",
          presupuesto_total: "",
          estado: "Borrador",
          estado_rendicion: "Pendiente",
          documentos: { asamblea: null, cotizaciones: null, elegido: null },
        });
      } else {
        alert("Error al crear el proyecto: " + text);
      }
    } catch (err) {
      alert("Error de red al crear el proyecto: " + err.message);
    }
  };

  const handleAprobarProyecto = () => {
    setEtapa(3);
  };

  return (
    <div className="space-y-8">
      {/* --- 5. AÑADIR EL JSX DEL MODAL --- */}
      {showNoPeriodoModal && (
        // --- ¡AQUÍ ESTÁ EL CAMBIO! ---
        // Cambiamos 'bg-opacity-50' por 'bg-opacity-30' para más transparencia
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          {/* --------------------------- */}
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4 text-indigo">Atención</h2>
            <p className="text-taupe mb-6">
              No se encontró un Periodo activo para su comunidad.
              <br />
              Debe crear un periodo antes de poder gestionar proyectos.
            </p>
            <button
              className="bg-indigo text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-taupe"
              onClick={() => navigate("/crear-periodo")} // Redirige a la página de Periodos
            >
              Ir a Periodos
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button
          className="bg-indigo text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-taupe"
          onClick={() => setEtapa(1)}
        >
          Crear Proyecto
        </button>
      </div>
      <h2 className="text-2xl font-bold text-deep-purple">
        Gestión de Proyectos
      </h2>
      <p className="text-taupe">
        Creación, seguimiento y rendición de proyectos comunitarios
      </p>
      <div className="flex justify-end mb-4"></div>
      {/* Etapa 1: Crear proyecto */}
      {etapa === 1 && (
        <form
          className="bg-white rounded-lg shadow p-6 border border-gray-200 max-w-xl mx-auto space-y-4"
          onSubmit={handleCrearProyecto}
        >
          <h3 className="text-lg font-bold text-indigo mb-2">
            Etapa 1: Creación de Proyecto
          </h3>
          <div>
            <label className="block text-taupe mb-1">Nombre del Proyecto</label>
            <input
              type="text"
              name="nombre"
              value={nuevoProyecto.nombre}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-taupe mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={nuevoProyecto.descripcion}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-taupe mb-1">Fecha Inicio</label>
              <input
                type="date"
                name="fecha_inicio"
                value={nuevoProyecto.fecha_inicio}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-taupe mb-1">Fecha Fin</label>
              <input
                type="date"
                name="fecha_fin"
                value={nuevoProyecto.fecha_fin}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-taupe mb-1">Presupuesto Total</label>
            <input
              type="number"
              name="presupuesto_total"
              value={nuevoProyecto.presupuesto_total}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label htmlFor="asamblea" className="block text-taupe mb-1">
                Acta de Asamblea
              </label>
              <label htmlFor="asamblea" className="w-full block">
                <span className="boton-subir-acta inline-block bg-taupe text-white rounded-lg px-4 py-2 font-semibold shadow cursor-pointer text-center w-full hover:bg-blush">
                  Subir Acta
                </span>
                <input
                  type="file"
                  id="asamblea"
                  name="asamblea"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>
              {nuevoProyecto.documentos.asamblea && (
                <div className="text-xs text-taupe mt-1 truncate">
                  {nuevoProyecto.documentos.asamblea.name}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="cotizaciones" className="block text-taupe mb-1">
                Cotizaciones
              </label>
              <label htmlFor="cotizaciones" className="w-full block">
                <span className="inline-block bg-taupe text-white rounded-lg px-4 py-2 font-semibold shadow cursor-pointer text-center w-full">
                  Subir Cotización
                </span>
                <input
                  type="file"
                  id="cotizaciones"
                  name="cotizaciones"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {nuevoProyecto.documentos.cotizaciones && (
                <div className="text-xs text-taupe mt-1 truncate">
                  {nuevoProyecto.documentos.cotizaciones.name}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="elegido" className="block text-taupe mb-1">
                Elegido
              </label>
              <label htmlFor="elegido" className="w-full block">
                <span className="inline-block bg-taupe text-white rounded-lg px-4 py-2 font-semibold shadow cursor-pointer text-center w-full">
                  Subir Elegido
                </span>
                <input
                  type="file"
                  id="elegido"
                  name="elegido"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {nuevoProyecto.documentos.elegido && (
                <div className="text-xs text-taupe mt-1 truncate">
                  {nuevoProyecto.documentos.elegido.name}
                </div>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="bg-indigo text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-taupe"
          >
            Crear Proyecto
          </button>
        </form>
      )}
      {/* Etapa 2: Revisión auditor (Oculto, sin lógica) */}
      {/* Etapa 3: Resumen general (Oculto, sin lógica) */}

      {/* Listado de proyectos existentes */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-deep-purple mb-2">
          Proyectos existentes
        </h3>
        {loading ? (
          <div className="text-center text-taupe">Cargando...</div>
        ) : proyectos.length === 0 ? (
          <div className="text-center text-taupe">Sin datos aún</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow border border-gray-200">
              <thead className="bg-blush">
                <tr>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">Fecha Inicio</th>
                  <th className="px-4 py-2 text-left">Fecha Fin</th>
                  <th className="px-4 py-2 text-left">Presupuesto Total</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-left">Estado Rendición</th>
                  <th className="px-4 py-2 text-left">Falta por Rendir</th>
                  <th className="px-4 py-2 text-left">Documentos</th>
                </tr>
              </thead>
              <tbody>
                {proyectos.map((p, idx) => {
                  const presupuesto = p.presupuesto_total || 0;
                  const montoRendido = p.total_rendido || 0;
                  const faltaPorRendir =
                    Number(presupuesto) - Number(montoRendido);
                  return (
                    <tr key={p.id}>
                      <td className="px-4 py-2">{p.nombre}</td>
                      <td className="px-4 py-2">
                        {formatFechaCL(p.fecha_inicio)}
                      </td>
                      <td className="px-4 py-2">
                        {formatFechaCL(p.fecha_fin)}
                      </td>
                      <td className="px-4 py-2">${formatMonto(presupuesto)}</td>
                      <td className="px-4 py-2">{p.estado || "Sin datos"}</td>
                      <td className="px-4 py-2">
                        {p.estado_rendicion || "Sin datos"}
                      </td>
                      <td className="px-4 py-2">
                        ${formatMonto(faltaPorRendir)}
                      </td>

                      <td className="px-4 py-2 space-x-2">
                        {p.acta_url ? (
                          <a
                            href={p.acta_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-indigo text-white px-2 py-1 rounded text-xs font-semibold hover:bg-taupe"
                            download
                          >
                            Acta
                          </a>
                        ) : (
                          <span className="text-xs text-taupe">Sin Acta</span>
                        )}

                        {p.cotizaciones_url ? (
                          <a
                            href={p.cotizaciones_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-indigo text-white px-2 py-1 rounded text-xs font-semibold hover:bg-taupe"
                            download
                          >
                            Cotiz.
                          </a>
                        ) : null}

                        {p.elegido_url ? (
                          <a
                            href={p.elegido_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-indigo text-white px-2 py-1 rounded text-xs font-semibold hover:bg-taupe"
                            download
                          >
                            Elegido
                          </a>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}