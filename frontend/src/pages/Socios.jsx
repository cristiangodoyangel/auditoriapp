
import React, { useEffect, useState } from 'react';
import TablaGenerica from '../components/TablaGenerica';

function formatFechaCL(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d)) return fecha;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function Socios() {
  // Detectar si el usuario es admin
  let isAdmin = false;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    isAdmin = user && (user.rol === 'admin' || user.role === 'admin');
  } catch {}

  const [socios, setSocios] = useState([]);

  React.useEffect(() => {
    const token = localStorage.getItem('access');
    fetch('http://localhost:8000/api/socios/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setSocios(Array.isArray(data) ? data : data.results || []))
      .catch(() => setSocios([]));
  }, []);

  // Estado para edición
  const [editando, setEditando] = useState(null);
  const [nuevoSocio, setNuevoSocio] = useState({nombre:'',apellido:'',rut:'',direccion:'',telefono:'',activo:true});

  // Función para agregar socio
  function handleAgregar() {
    setEditando('nuevo');
    setNuevoSocio({nombre:'',apellido:'',rut:'',direccion:'',telefono:'',activo:true});
  }
  function handleGuardarNuevo() {
    setSocios([...socios, {...nuevoSocio, id: socios.length+1}]);
    setEditando(null);
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

  return (
    <div className="space-y-6">
      <h2 className="text-secondary text-2xl font-bold">Gestión de Socios</h2>
      <p className="text-taupe">Registro y control de socios de la comunidad</p>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPIs reales aquí */}
      </div>
      {/* Botón agregar solo para admin */}
      {isAdmin && (
        <button className="bg-indigo text-white px-4 py-2 rounded-lg font-semibold shadow mb-2" onClick={handleAgregar}>Agregar Socio</button>
      )}
      {/* Formulario de edición/agregar */}
      {(editando !== null) && (
        <div className="bg-white border border-indigo rounded-lg p-4 mb-4 max-w-lg">
          <h3 className="font-bold mb-2">{editando === 'nuevo' ? 'Agregar Socio' : 'Editar Socio'}</h3>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input type="text" className="border rounded px-2 py-1" placeholder="Nombre" value={nuevoSocio.nombre} onChange={e=>setNuevoSocio({...nuevoSocio,nombre:e.target.value})} />
            <input type="text" className="border rounded px-2 py-1" placeholder="Apellido" value={nuevoSocio.apellido} onChange={e=>setNuevoSocio({...nuevoSocio,apellido:e.target.value})} />
            <input type="text" className="border rounded px-2 py-1" placeholder="RUT" value={nuevoSocio.rut} onChange={e=>setNuevoSocio({...nuevoSocio,rut:e.target.value})} />
            <input type="text" className="border rounded px-2 py-1" placeholder="Dirección" value={nuevoSocio.direccion} onChange={e=>setNuevoSocio({...nuevoSocio,direccion:e.target.value})} />
            <input type="text" className="border rounded px-2 py-1" placeholder="Teléfono" value={nuevoSocio.telefono} onChange={e=>setNuevoSocio({...nuevoSocio,telefono:e.target.value})} />
            <label className="flex items-center gap-2 col-span-2">
              <input type="checkbox" checked={nuevoSocio.activo} onChange={e=>setNuevoSocio({...nuevoSocio,activo:e.target.checked})} /> Socio Activo
            </label>
          </div>
          <div className="flex gap-2">
            <button className="bg-indigo text-white px-3 py-1 rounded" onClick={editando==='nuevo'?handleGuardarNuevo:handleGuardarEdicion}>Guardar</button>
            <button className="bg-taupe text-white px-3 py-1 rounded" onClick={()=>setEditando(null)}>Cancelar</button>
            {editando!=='nuevo' && (
              <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={()=>handleEliminar(editando)}>Eliminar</button>
            )}
          </div>
        </div>
      )}
      {/* Tabla de socios */}
      <div className="bg-card rounded-lg shadow p-4 mt-6 border border-secondary">
        <div className="font-bold text-secondary mb-2">Socios Registrados</div>
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
              return row.activo ? 'Sí' : 'No';
            }
            if (col.key === 'nombre' && isAdmin) {
              return <span className="text-indigo font-bold cursor-pointer underline" onClick={()=>handleEditar(row)}>{row.nombre}</span>;
            }
            return row[col.key] || '';
          }}
          emptyText="No hay socios registrados"
        />
      </div>
    </div>
  );
}
