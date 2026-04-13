import remoteConfig from '@react-native-firebase/remote-config';

let cachedApiUrl: string | null = null;
let loadPromise: Promise<string> | null = null;

async function fetchRemoteConfig(): Promise<string> {
  await remoteConfig().setDefaults({
    API_URL: 'http://localhost:3000',
  });

  await remoteConfig().setConfigSettings({
    minimumFetchIntervalMillis: __DEV__ ? 0 : 12 * 60 * 60 * 1000,
  });

  await remoteConfig().fetchAndActivate();
  const apiUrl = remoteConfig().getValue('API_URL').asString();
  cachedApiUrl = apiUrl;
  return apiUrl;
}

/** Single-flight: Firebase Remote Config is fetched once per app session. */
export async function ensureApiBaseUrl(): Promise<string> {
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
