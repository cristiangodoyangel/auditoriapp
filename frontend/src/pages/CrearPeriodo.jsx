import React, { useState } from 'react';


function formatFechaCL(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d)) return fecha;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function CrearPeriodo({ onPeriodoCreado }) {
  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [montoAlbemarle, setMontoAlbemarle] = useState('');
  const [montoAnterior, setMontoAnterior] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access');
      const res = await fetch('http://localhost:8000/api/periodos/periodos/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          monto_asignado: Number(montoAlbemarle) + Number(montoAnterior),
          monto_anterior: montoAnterior,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (onPeriodoCreado) onPeriodoCreado();
      } else {
        setError(data.error || 'Error al crear el periodo');
      }
    } catch (err) {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  return (

    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
      

      <h2 className="text-2xl font-bold mb-2 text-primary">Crear Nuevo Periodo</h2>
      <p className="mb-6 text-base-content/70">Ingresa los datos del periodo y el monto asignado por Albemarle</p>


      <div className="form-control w-full mb-4">
        <label className="label">
          <span className="label-text">Nombre del Periodo</span>
        </label>

        <input 
          type="text" 
          className="input input-bordered w-full" 
          value={nombre} 
          onChange={e => setNombre(e.target.value)} 
          placeholder="Ej: Periodo 2025-2026" 
        />
      </div>


      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="form-control flex-1">
          <label className="label">
            <span className="label-text">Fecha de Inicio</span>
          </label>
          <input 
            type="date" 
            className="input input-bordered w-full" 
            value={fechaInicio} 
            onChange={e => setFechaInicio(e.target.value)} 
          />
          {fechaInicio && <div className="text-xs text-base-content/70 mt-1">{formatFechaCL(fechaInicio)}</div>}
        </div>
        <div className="form-control flex-1">
          <label className="label">
            <span className="label-text">Fecha de Fin</span>
          </label>
          <input 
            type="date" 
            className="input input-bordered w-full" 
            value={fechaFin} 
            onChange={e => setFechaFin(e.target.value)} 
          />
          {fechaFin && <div className="text-xs text-base-content/70 mt-1">{formatFechaCL(fechaFin)}</div>}
        </div>
      </div>


      <div className="form-control w-full mb-4">
        <label className="label">
          <span className="label-text">Monto Disponible del Periodo Anterior</span>
          <span className="label-text-alt">CLP (opcional)</span>
        </label>
        <div className="input-group">
          <span>$</span>
          <input 
            type="number" 
            className="input input-bordered w-full" 
            value={montoAnterior} 
            onChange={e => setMontoAnterior(Number(e.target.value))} 
            min="0" 
            placeholder="0"
          />
        </div>
      </div>


      <div className="form-control w-full mb-4">
        <label className="label">
          <span className="label-text">Monto Asignado por Albemarle</span>
          <span className="label-text-alt">CLP</span>
        </label>
        <div className="input-group">
          <span>$</span>
          <input 
            type="number" 
            className="input input-bordered w-full" 
            value={montoAlbemarle} 
            onChange={e => setMontoAlbemarle(e.target.value)} 
            min="0" 
            placeholder="5000000"
          />
        </div>
      </div>


      {error && (
        <div className="alert alert-error shadow-sm mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      )}


      <div className="flex justify-end gap-2 mt-6">
        <button 
          type="button" 
          className="btn btn-outline" 
          onClick={() => window.location.href = '/dashboard'}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading}
        >
          {loading && <span className="loading loading-spinner"></span>}
          {loading ? 'Creando...' : 'Crear Periodo'}
        </button>
      </div>
    </form>
  );
}