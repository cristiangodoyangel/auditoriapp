import React, { useEffect, useState, useCallback } from "react"; // <-- 1. IMPORTAR useCallback

function formatMonto(monto) {
  if (monto === undefined || monto === null || isNaN(monto)) return "Sin datos";
  return Number(monto).toLocaleString("es-CL", { maximumFractionDigits: 0 });
}

function formatFechaCL(fecha) {
  // Comprobación rápida para evitar errores con fechas nulas o mal formadas
  if (!fecha || typeof fecha !== 'string' || !fecha.includes('-')) return '';
  
  // Asumimos que la fecha viene del backend como 'YYYY-MM-DD'
  // T'[0]' maneja si viniera como 'YYYY-MM-DDTHH:MM:SS'
  const parts = fecha.split('T')[0].split('-');
  
  if (parts.length !== 3) return fecha; // Devolver original si no es el formato esperado
  
  // Formato: DD-MM-YYYY
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
  // Detectar si el usuario es auditor
  let isAuditor = false;
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("[DEBUG] Usuario en localStorage:", user);
    isAuditor = user && (user.rol === "auditor" || user.role === "auditor");
    console.log("[DEBUG] isAuditor:", isAuditor);
  } catch (err) {
    console.log("[DEBUG] Error al leer usuario de localStorage:", err);
  }

  // ####################################################################
  // ### INICIO DEL BLOQUE CORREGIDO (useCallback) ###
  // ####################################################################

  // --- 1. FUNCIÓN DE PROYECTOS (Definida afuera con useCallback) ---
  const fetchProyectos = useCallback(async () => {
    const token = localStorage.getItem("access"); // Obtener token aquí
    setLoading(true); // Se activa el loading de la tabla
    try {
      const res = await fetch("http://localhost:8000/api/proyectos/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = [];
      const status = res.status;
      const text = await res.text();
      console.log("[DEBUG] Status respuesta proyectos:", status);
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.log("[DEBUG] Error al parsear proyectos:", err);
        data = [];
      }
      setProyectos(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("[DEBUG] Error al obtener proyectos:", err);
      setProyectos([]);
    }
    setLoading(false); // Se desactiva el loading de la tabla
  }, [setProyectos, setLoading]); // Dependencias de la función

  // --- 2. useEffect (El Orquestador) ---
  useEffect(() => {
    const token = localStorage.getItem("access");
    console.log("[DEBUG] Token:", token);

    // --- FUNCIÓN DE COMUNIDAD (Ahora devuelve el ID) ---
    async function fetchComunidad() {
      let comunidadFromToken = null;
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.comunidad && user.comunidad.id) {
          comunidadFromToken = user.comunidad.id;
        }
      } catch (err) {
        console.log("[DEBUG] Error al leer comunidadFromToken:", err);
      }

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
            console.log("[DEBUG] fetchComunidad SUCCESS. ID encontrado:", id);
            setComunidadId(id); // Seteamos estado
            return id; // Devolvemos el ID para el siguiente paso
          } else {
            console.error(
              "[DEBUG] fetchComunidad ERROR: No se encontró ID de comunidad en profile:",
              data
            );
            setComunidadId(null);
            return null;
          }
        } else {
          if (comunidadFromToken) {
            console.warn(
              "[DEBUG] fetchComunidad FALLÓ. Usando ID del token:",
              comunidadFromToken
            );
            setComunidadId(comunidadFromToken);
            return comunidadFromToken;
          }
          console.error("[DEBUG] fetchComunidad FALLÓ y no hay ID en token.");
          setComunidadId(null);
          return null;
        }
      } catch (err) {
        if (comunidadFromToken) {
          console.warn(
            "[DEBUG] fetchComunidad CATCH. Usando ID del token:",
            comunidadFromToken
          );
          setComunidadId(comunidadFromToken);
          return comunidadFromToken;
        }
        console.error("[DEBUG] fetchComunidad CATCH: Error de red", err);
        setComunidadId(null);
        return null;
      }
    }

    // --- FUNCIÓN DE PERIODO (Ahora recibe el ID como argumento) ---
    async function fetchPeriodoVigente(idComunidad) {
      if (!idComunidad) {
        console.warn(
          "[DEBUG] fetchPeriodoVigente OMITIDO: No se proveyó idComunidad."
        );
        setPeriodoVigente(null);
        return;
      }

      console.log(
        `[DEBUG] fetchPeriodoVigente INICIADO para comunidad ID: ${idComunidad}`
      );
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
          console.log("[DEBUG] Lista periodos recibida:", listaPeriodos);

          const hoy = new Date().toISOString().slice(0, 10);

          const vigente = listaPeriodos.find((p) => {
            const esDeMiComunidad = String(p.comunidad) === String(idComunidad);
            const fechaValida = p.fecha_inicio <= hoy && p.fecha_fin >= hoy;
            return esDeMiComunidad && fechaValida;
          });

          if (vigente) {
            console.log("[DEBUG] Periodo vigente ENCONTRADO:", vigente);
            setPeriodoVigente(vigente);
          } else {
            console.warn(
              `[DEBUG] NO se encontró periodo vigente para hoy (${hoy}) en la comunidad ${idComunidad}`
            );
            setPeriodoVigente(null);
            alert(
              "Atención: No se encontró un Periodo activo para su comunidad. No podrá crear proyectos."
            );
          }
        } else {
          console.error("[DEBUG] Error al obtener periodos:", res.status);
        }
      } catch (err) {
        console.error("[DEBUG] Error de red en fetchPeriodoVigente:", err);
        setPeriodoVigente(null);
      }
    }

    // --- EL ORQUESTADOR ---
    async function cargarDatosIniciales() {
      const idComunidad = await fetchComunidad();
      await fetchPeriodoVigente(idComunidad);
      await fetchProyectos(); // <-- Llama a la función definida afuera
    }

    cargarDatosIniciales();
  }, [fetchProyectos]); // <-- 3. AÑADIR fetchProyectos como dependencia del useEffect
  // ####################################################################
  // ### FIN DEL BLOQUE CORREGIDO ###
  // ####################################################################

  // Etapa 1: Crear proyecto y cargar documentos
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
    console.log("[DEBUG] handleCrearProyecto comunidadId:", comunidadId);
    console.log("[DEBUG] handleCrearProyecto periodoVigente:", periodoVigente);
    if (!comunidadId) {
      alert("No se pudo obtener la comunidad del usuario.");
      console.log("[DEBUG] ERROR: comunidadId no disponible");
      return;
    }
    if (!periodoVigente || !periodoVigente.id) {
      alert(
        "No hay un Periodo vigente seleccionado. Verifique que exista un periodo activo para la fecha de hoy."
      );
      console.log(
        "[DEBUG] ERROR: periodoVigente no disponible",
        periodoVigente
      );
      return;
    }
    const presupuestoFormateado = Number(
      nuevoProyecto.presupuesto_total
    ).toFixed(2);
    console.log("[DEBUG] Formulario nuevoProyecto:", nuevoProyecto);
    console.log("[DEBUG] presupuestoFormateado:", presupuestoFormateado);
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
      console.log("[DEBUG] Respuesta crear proyecto status:", res.status);
      const text = await res.text();
      console.log("[DEBUG] Respuesta crear proyecto text:", text);
      if (res.ok) {
        setEtapa(2);
        fetchProyectos(); // <-- 4. ESTA LLAMADA AHORA SÍ FUNCIONA
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
        console.log("[DEBUG] ERROR: No se pudo crear el proyecto:", text);
      }
    } catch (err) {
      // Este 'catch' ahora solo atrapará errores de red REALES
      alert("Error de red al crear el proyecto: " + err.message);
      console.log("[DEBUG] ERROR: Red al crear proyecto", err);
    }
  };

  // Etapa 2: Revisión auditor
  const handleAprobarProyecto = () => {
    // Aquí iría la lógica para aprobar el proyecto en el backend
    setEtapa(3);
  };

  return (
    <div className="space-y-8">
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
          {/* Campo periodo eliminado, se asigna automáticamente */}
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
      {/* Etapa 2: Revisión auditor solo para auditores */}
      {etapa === 2 && isAuditor && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200 max-w-xl mx-auto space-y-4">
          <h3 className="text-lg font-bold text-indigo mb-2">
            Etapa 2: Revisión por Auditor
          </h3>
          <p className="text-taupe">
            Un auditor debe revisar la documentación cargada y aprobar el
            proyecto para avanzar.
          </p>
          <button
            className="bg-indigo text-white px-4 py-2 rounded-lg font-semibold"
            onClick={handleAprobarProyecto}
          >
            Aprobar Proyecto
          </button>
        </div>
      )}
      {/* Etapa 3: Resumen general */}
      {etapa === 3 && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200 max-w-xl mx-auto space-y-4">
          <h3 className="text-lg font-bold text-indigo mb-2">
            Etapa 3: Resumen General
          </h3>
          <div className="mb-2">
            <span className="font-semibold text-taupe">Nombre:</span>{" "}
            {nuevoProyecto.nombre}
          </div>
          <div className="mb-2">
            <span className="font-semibold text-taupe">Presupuesto:</span> $
            {formatMonto(nuevoProyecto.presupuesto)}
          </div>
          <div className="mb-2">
            <span className="font-semibold text-taupe">
              Respaldo de Asamblea:
            </span>{" "}
            {nuevoProyecto.documentos.asamblea
              ? nuevoProyecto.documentos.asamblea.name
              : "Sin archivo"}
          </div>
          <div className="mb-2">
            <span className="font-semibold text-taupe">Cotizaciones:</span>{" "}
            {nuevoProyecto.documentos.cotizaciones
              ? nuevoProyecto.documentos.cotizaciones.name
              : "Sin archivo"}
          </div>
          <div className="mb-2">
            <span className="font-semibold text-taupe">Elegido:</span>{" "}
            {nuevoProyecto.documentos.elegido
              ? nuevoProyecto.documentos.elegido.name
              : "Sin archivo"}
          </div>
          <div className="mt-4 text-green-600 font-bold">
            Proyecto aprobado y listo para ejecución.
          </div>
        </div>
      )}
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
                  const presupuesto = p.presupuesto_total || p.presupuesto || 0;
                  const montoRendido = p.monto_rendido || 0;
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
                          <span className="text-xs text-taupe">Sin docs</span>
                        )}
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