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
  const token = await getAccessTokenAsync();
  if (token != null && token !== '') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
