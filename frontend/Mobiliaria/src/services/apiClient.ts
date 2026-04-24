import axios from 'axios';
import { clearSessionTokens, getAccessTokenAsync, getRefreshTokenAsync, saveSessionTokens } from '@utils/token';
import { ensureApiBaseUrl } from '@utils/remote-config';

export const apiClient = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = await getRefreshTokenAsync();
    if (!refreshToken) {
      return null;
    }

    try {
      const base = await ensureApiBaseUrl();
      const { data } = await axios.post(
        `${String(base || '').replace(/\/$/, '')}/auth/refresh`,
        { refreshToken },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      const nextAccessToken = data?.accessToken || data?.token;
      const nextRefreshToken = data?.refreshToken || refreshToken;
      if (!nextAccessToken) {
        return null;
      }
      await saveSessionTokens(nextAccessToken, nextRefreshToken);
      return nextAccessToken;
    } catch (error) {
      await clearSessionTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

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
    const originalRequest = error?.config || {};
    const shouldTryRefresh =
      error?.response?.status === 401 &&
      !originalRequest._retry &&
      !String(originalRequest?.url || '').includes('/auth/refresh') &&
      !String(originalRequest?.url || '').includes('/auth/login');

    if (shouldTryRefresh) {
      originalRequest._retry = true;
      return refreshAccessToken().then((token) => {
        if (!token) {
          return Promise.reject(error);
        }
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

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
