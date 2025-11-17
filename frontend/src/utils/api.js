

const API_URL = 'http://localhost:8000/api'; 

export async function apiFetch(endpoint, options = {}) {

  let token = localStorage.getItem('access');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
  };


  let response = await fetch(`${API_URL}${endpoint}`, config);


  if (response.status === 401) {
    console.log('Token expirado. Intentando renovar...');
    
    const refresh = localStorage.getItem('refresh');
    
    if (refresh) {
      try {

        const refreshResponse = await fetch(`${API_URL}/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();

          localStorage.setItem('access', data.access);
          console.log('Token renovado con éxito');

          config.headers['Authorization'] = `Bearer ${data.access}`;
          

          response = await fetch(`${API_URL}${endpoint}`, config);
        } else {

          throw new Error('Refresh token inválido');
        }
      } catch (error) {

        console.error('Sesión expirada:', error);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject('Sesión expirada');
      }
    } else {

      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject('No hay token de refresco');
    }
  }

  return response;
}