import remoteConfig from '@react-native-firebase/remote-config';

export const initRemoteConfig = async () => {
  await remoteConfig().setDefaults({
    API_URL: 'http://localhost:3000', // Valor por defecto
  });

  await remoteConfig().setConfigSettings({
    minimumFetchIntervalMillis: 0, // solo para desarrollo
  });

  await remoteConfig().fetchAndActivate();

  const apiUrl = remoteConfig().getValue('API_URL').asString();
  return apiUrl;
};
