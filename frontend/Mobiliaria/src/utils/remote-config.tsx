import remoteConfig from '@react-native-firebase/remote-config';
import { API_URL, USE_LOCAL_API_URL } from '@env';

let cachedApiUrl: string | null = null;
let cachedSocketUrl: string | null = null;
let loadPromise: Promise<string> | null = null;

const isTruthyFlag = (value: string | undefined): boolean => {
  if (value == null) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
};

const shouldUseLocalEnvApi = isTruthyFlag(USE_LOCAL_API_URL);

const getLocalApiUrl = (): string | null => {
  console.log('[RemoteConfig] env flags', {
    USE_LOCAL_API_URL,
    API_URL,
    shouldUseLocalEnvApi,
  });
  if (!shouldUseLocalEnvApi) return null;
  const localApiUrl = API_URL?.trim();
  if (localApiUrl == null || localApiUrl === '') {
    console.warn('[RemoteConfig] USE_LOCAL_API_URL is enabled but API_URL is empty');
    return null;
  }
  console.log('[RemoteConfig] using local API_URL from .env', { localApiUrl });
  return localApiUrl;
};

async function fetchRemoteConfig(): Promise<string> {
  console.log('[RemoteConfig] using Firebase Remote Config API_URL');
  await remoteConfig().setDefaults({
    API_URL: 'http://localhost:3000',
    SOCKET_URL: 'http://localhost:3000',
  });

  await remoteConfig().setConfigSettings({
    minimumFetchIntervalMillis: __DEV__ ? 0 : 12 * 60 * 60 * 1000,
  });

  await remoteConfig().fetchAndActivate();
  const apiUrl = remoteConfig().getValue('API_URL').asString();
  const socketUrl = remoteConfig().getValue('SOCKET_URL').asString();
  cachedApiUrl = apiUrl;
  cachedSocketUrl = socketUrl || apiUrl;
  return apiUrl;
}

/** Single-flight: Firebase Remote Config is fetched once per app session. */
export async function ensureApiBaseUrl(): Promise<string> {
  const localApiUrl = getLocalApiUrl();
  if (localApiUrl != null) {
    cachedApiUrl = localApiUrl;
    cachedSocketUrl = localApiUrl;
    return localApiUrl;
  }
  if (cachedApiUrl != null) {
    return cachedApiUrl;
  }
  if (loadPromise == null) {
    loadPromise = fetchRemoteConfig();
  }
  try {
    return await loadPromise;
  } catch (e) {
    loadPromise = null;
    throw e;
  }
}

/** Optional eager load at app startup (see App.tsx). */
export async function bootstrapRemoteConfig(): Promise<string> {
  return ensureApiBaseUrl();
}

/** @deprecated Use ensureApiBaseUrl — now cached, no repeated fetch. */
export const initRemoteConfig = ensureApiBaseUrl;

export async function ensureSocketUrl(): Promise<string> {
  if (cachedSocketUrl != null) {
    return cachedSocketUrl;
  }
  await ensureApiBaseUrl();
  return cachedSocketUrl || cachedApiUrl || 'http://localhost:3000';
}
