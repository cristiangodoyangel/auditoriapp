import React, { useState } from 'react';

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
    <div className="flex items-center justify-center min-h-screen bg-background">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg border border-secondary">
        <h2 className="text-2xl font-bold mb-2 text-indigo">Crear Nuevo Periodo</h2>
        <p className="mb-4 text-taupe">Ingresa los datos del periodo y el monto asignado por Albemarle</p>
        <div className="mb-4">
          <label className="block text-taupe mb-2">Monto Disponible del Periodo Anterior</label>
          <div className="flex items-center gap-2">
            <span className="text-indigo text-xl">$</span>
            <input type="number" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo" value={montoAnterior} onChange={e => setMontoAnterior(Number(e.target.value))} min="0" />
          </div>
          <span className="text-sm text-taupe">Ingresa el monto en pesos chilenos (CLP)</span>
        </div>
        <div className="mb-4">
          <label className="block text-taupe mb-2">Nombre del Periodo</label>
          <input type="text" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Periodo 2025-2026" />
        </div>
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <label className="block text-taupe mb-2">Fecha de Inicio</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="block text-taupe mb-2">Fecha de Fin</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-taupe mb-2">Monto Asignado por Albemarle</label>
          <div className="flex items-center gap-2">
            <span className="text-indigo text-xl">$</span>
            <input type="number" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo" value={montoAlbemarle} onChange={e => setMontoAlbemarle(e.target.value)} min="0" />
          </div>
          <span className="text-sm text-taupe">Ingresa el monto en pesos chilenos (CLP)</span>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="flex justify-end gap-2 mt-6">
          <button type="button" className="bg-white border border-indigo text-indigo px-4 py-2 rounded-lg font-semibold" onClick={() => window.location.href = '/dashboard'}>Cancelar</button>
          <button type="submit" className="bg-indigo text-white px-4 py-2 rounded-lg font-semibold hover:bg-taupe transition" disabled={loading}>{loading ? 'Creando...' : 'Crear Periodo'}</button>
        </div>
      </form>
    </div>
  );
}
