import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

// Configurar axios para incluir el token automáticamente
const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getDashboardKPIs = async () => {
  try {
    const response = await apiClient.get('/dashboard/kpis/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al obtener KPIs');
  }
};

export const getProyectos = async () => {
  try {
    const response = await apiClient.get('/proyectos/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al obtener proyectos');
  }
};

export const createProyecto = async (proyectoData) => {
  try {
    const response = await apiClient.post('/proyectos/', proyectoData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al crear proyecto');
  }
};

export const enviarProyectoRevision = async (proyectoId) => {
  try {
    const response = await apiClient.post(`/proyectos/${proyectoId}/enviar_revision/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al enviar proyecto a revisión');
  }
};

export const aprobarProyecto = async (proyectoId, comentarios = '') => {
  try {
    const response = await apiClient.post(`/proyectos/${proyectoId}/aprobar/`, {
      comentarios
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al aprobar proyecto');
  }
};

export const getSocios = async () => {
  try {
    const response = await apiClient.get('/socios/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al obtener socios');
  }
};

export const createSocio = async (socioData) => {
  try {
    const response = await apiClient.post('/socios/', socioData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al crear socio');
  }
};

export const getPeriodos = async () => {
  try {
    const response = await apiClient.get('/periodos/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al obtener periodos');
  }
};