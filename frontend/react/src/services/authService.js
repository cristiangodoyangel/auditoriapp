import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

// Configurar axios para incluir el token automáticamente
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar tokens expirados
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Reintentar la petición original
          error.config.headers.Authorization = `Bearer ${access}`;
          return axios.request(error.config);
        } catch (refreshError) {
          // Si falla el refresh, logout
          logout();
        }
      } else {
        logout();
      }
    }
    return Promise.reject(error);
  }
);

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login/`, {
      username,
      password,
    });
    
    const { access, refresh, user } = response.data;
    
    // Guardar tokens y datos del usuario
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { success: true, user };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Error de conexión' 
    };
  }
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  window.location.href = '/';
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};