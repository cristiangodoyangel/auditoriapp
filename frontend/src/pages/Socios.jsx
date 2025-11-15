import React, { useEffect, useState } from 'react';
import TablaGenerica from '../components/TablaGenerica';

// --- 1. AQUÍ ESTÁN TUS 30 SOCIOS DE PRUEBA ---
const mockSocios = [];
for (let i = 1; i <= 30; i++) {
  mockSocios.push({
    id: i,
    nombre: `NombreSocio ${i}`,
    apellido: `ApellidoSocio ${i}`,
    rut: `12.345.${i < 10 ? '00' : '0'}${i}-K`,
    direccion: `Calle Ficticia #${i}, Calama`,
    telefono: `+56 9 1234 56${i < 10 ? '0' : ''}${i}`,
    activo: i % 4 !== 0, // <-- 75% activos, 25% inactivos
    comunidad: 1 // (ID de comunidad de prueba)
  });
}
// ---------------------------------------------

export default function Socios() {
  let isAdmin = false;
  let comunidadId = null;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    isAdmin = user && (user.rol === 'admin' || user.role === 'admin');
    if (user && user.comunidad && user.comunidad.id) {
      comunidadId = user.comunidad.id;
    } else if (user && user.comunidad_id) {
      comunidadId = user.comunidad_id;
    }
  } catch {}

  // --- 2. PRE-CARGAMOS EL ESTADO CON LOS 30 SOCIOS ---
  const [socios, setSocios] = useState(mockSocios);
  const [loading, setLoading] = useState(true);
  // ----------------------------------------------------
  
  const [formLoading, setFormLoading] = useState(false);

  // --- 3. COMENTAMOS EL useEffect PARA QUE NO BORRE LOS DATOS MOCK ---
  React.useEffect(() => {
    // Simulamos que la carga terminó
    setLoading(false);
    
    /* // --- DESCOMENTA ESTO PARA CONECTAR AL API REAL ---
    const token = localStorage.getItem('access');
    setLoading(true); 
    fetch('http://localhost:8000/api/comunidades/socios/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setSocios(Array.isArray(data) ? data : data.results || []);
        setLoading(false); 
      })
      .catch(() => {
        setSocios([]);
        setLoading(false); 
      });
    */
  }, []);
  // -----------------------------------------------------------------

  const [editando, setEditando] = useState(null);
  const [nuevoSocio, setNuevoSocio] = useState({nombre:'',apellido:'',rut:'',direccion:'',telefono:'',activo:true});

  function handleAgregar() {
    setEditando('nuevo');
    setNuevoSocio({nombre:'',apellido:'',rut:'',direccion:'',telefono:'',activo:true, comunidad: comunidadId});
  }

  // (Simulamos el guardado localmente para que funcione con los datos mock)
  function handleGuardarNuevo() {
    setFormLoading(true);
    // Simulamos un guardado
    setTimeout(() => {
      const socioGuardado = { ...nuevoSocio, id: socios.length + 1 };
      setSocios([...socios, socioGuardado]);
      setEditando(null);
      setFormLoading(false);
    }, 500);
  }

  function handleEditar(socio) {
    if (!isAdmin) return;
    setEditando(socio.id);
    setNuevoSocio({...socio});
  }
  
  function handleGuardarEdicion() {
    setSocios(socios.map(s => s.id === editando ? {...nuevoSocio, id: editando} : s));
    setEditando(null);
  }
  
  function handleEliminar(id) {
    setSocios(socios.filter(s => s.id !== id));
    setEditando(null);
  }

  const sociosActivos = socios.filter(s => s.activo).length;
  const sociosInactivos = socios.length - sociosActivos;

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 p-4 rounded-box bg-base-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-primary">Gestión de Socios</h2>
          <p className="text-base-content/70">
            Registro y control de socios de la comunidad
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={handleAgregar}>
            Agregar Socio
          </button>
        )}
      </div>

      <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
        <div className="stat">
          <div className="stat-title">Socios Totales</div>
          <div className="stat-value text-primary">{socios.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title ">Socios Activos</div>
          <div className="stat-value text-primary">{sociosActivos}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Socios Inactivos</div>
          <div className="stat-value text-warning">{sociosInactivos}</div>
        </div>
      </div>

      {(editando !== null) && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title">{editando === 'nuevo' ? 'Agregar Socio' : 'Editar Socio'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Nombre</span></label>
                <input type="text" className="input input-bordered" placeholder="Nombre" value={nuevoSocio.nombre} onChange={e=>setNuevoSocio({...nuevoSocio,nombre:e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Apellido</span></label>
                <input type="text" className="input input-bordered" placeholder="Apellido" value={nuevoSocio.apellido} onChange={e=>setNuevoSocio({...nuevoSocio,apellido:e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">RUT</span></label>
                <input type="text" className="input input-bordered" placeholder="RUT" value={nuevoSocio.rut} onChange={e=>setNuevoSocio({...nuevoSocio,rut:e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Dirección</span></label>
                <input type="text" className="input input-bordered" placeholder="Dirección" value={nuevoSocio.direccion} onChange={e=>setNuevoSocio({...nuevoSocio,direccion:e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Teléfono</span></label>
                <input type="text" className="input input-bordered" placeholder="Teléfono" value={nuevoSocio.telefono} onChange={e=>setNuevoSocio({...nuevoSocio,telefono:e.target.value})} />
              </div>
              <div className="form-control md:col-span-2">
                <label className="label cursor-pointer justify-start gap-4">
                  <input type="checkbox" className="checkbox" checked={nuevoSocio.activo} onChange={e=>setNuevoSocio({...nuevoSocio,activo:e.target.checked})} />
                  <span className="label-text">Socio Activo</span> 
                </label>
              </div>
            </div>
            <div className="card-actions justify-end gap-2">
              {editando!=='nuevo' && (
                <button className="btn btn-error" onClick={()=>handleEliminar(editando)}>Eliminar</button>
              )}
              <button className="btn btn-ghost" onClick={()=>setEditando(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={editando==='nuevo'?handleGuardarNuevo:handleGuardarEdicion} disabled={formLoading}>
                {formLoading && <span className="loading loading-spinner"></span>}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center p-12">
          <span className="loading loading-lg loading-spinner text-primary"></span>
        </div>
      ) : (
        <TablaGenerica
          columns={[
            { key: 'nombre', label: 'Nombre' },
            { key: 'apellido', label: 'Apellido' },
            { key: 'rut', label: 'RUT' },
            { key: 'direccion', label: 'Dirección' },
            { key: 'telefono', label: 'Teléfono' },
            { key: 'activo', label: 'Socio Activo' },
          ]}
          data={socios}
          renderCell={(row, col) => {
            if (col.key === 'activo') {
              return row.activo 
                ? <div className="badge badge-success badge-outline">Sí</div> 
                : <div className="badge badge-ghost">No</div>;
            }
            if (col.key === 'nombre' && isAdmin) {
              return <span className="link link-primary font-bold" onClick={()=>handleEditar(row)}>{row.nombre}</span>;
            }
            return row[col.key] || '';
          }}
          emptyText="No hay socios registrados"
        />
      )}
    </div>
  );
}