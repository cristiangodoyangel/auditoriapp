import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.access) {
        // Guardar token si es necesario
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Si el usuario es admin de comunidad, consultar periodo activo
        if (data.user.rol === 'admin' && data.user.comunidad && data.user.comunidad.id) {
          try {
            const periodoRes = await fetch('http://localhost:8000/api/auth/inicio-admin-comunidad/', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${data.access}`,
                'Content-Type': 'application/json'
              }
            });
            const periodoData = await periodoRes.json();
            if (periodoData.redirect === 'dashboard') {
              window.location.href = '/dashboard';
            } else if (periodoData.redirect === 'crear_periodo') {
              window.location.href = '/crear-periodo';
            } else if (periodoData.error) {
              setError(periodoData.error);
            }
          } catch (err) {
            setError('Error verificando periodo activo');
          }
        } else {
          onLogin();
        }
      } else {
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md border border-secondary">
        <h2 className="text-2xl font-bold mb-4 text-indigo">Iniciar Sesión</h2>
        <div className="mb-4">
          <label className="block text-taupe mb-2">Usuario</label>
          <input type="text" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block text-taupe mb-2">Contraseña</label>
          <input type="password" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <button type="submit" className="w-full bg-indigo text-white py-2 rounded-lg font-semibold hover:bg-taupe transition" disabled={loading}>{loading ? 'Ingresando...' : 'Entrar'}</button>
      </form>
    </div>
  );
}
