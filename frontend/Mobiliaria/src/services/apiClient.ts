import axios from 'axios';
import { getAccessTokenAsync } from '@utils/token';
import { ensureApiBaseUrl } from '@utils/remote-config';

export const apiClient = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const base = await ensureApiBaseUrl();
  config.baseURL = base;
  const method = (config.method || 'get').toUpperCase();
  const fullUrl = `${String(base || '').replace(/\/$/, '')}/${String(config.url || '').replace(/^\//, '')}`;
  console.log('[ApiClient] request', {
    method,
    baseURL: base,
    url: config.url,
    fullUrl,
  });
  const token = await getAccessTokenAsync();
  if (token != null && token !== '') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const method = (response.config.method || 'get').toUpperCase();
    const fullUrl = `${String(response.config.baseURL || '').replace(/\/$/, '')}/${String(response.config.url || '').replace(/^\//, '')}`;
    console.log('[ApiClient] response', {
      method,
      baseURL: response.config.baseURL,
      url: response.config.url,
      fullUrl,
      status: response.status,
    });
    return response;
  },
  (error) => {
    const method = (error?.config?.method || 'get').toUpperCase();
    const fullUrl = `${String(error?.config?.baseURL || '').replace(/\/$/, '')}/${String(error?.config?.url || '').replace(/^\//, '')}`;
    console.error('[ApiClient] response:error', {
      method,
      baseURL: error?.config?.baseURL,
      url: error?.config?.url,
      fullUrl,
      status: error?.response?.status,
      message: error?.message,
    });
    return Promise.reject(error);
  }
);
