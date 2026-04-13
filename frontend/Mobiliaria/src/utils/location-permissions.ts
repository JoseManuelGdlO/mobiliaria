import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';

export const ensureLocationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const granted = await Geolocation.requestAuthorization('always');
    return granted === 'granted';
  }

  const fine = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );
  const coarse = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
  );

  if (
    fine !== PermissionsAndroid.RESULTS.GRANTED ||
    coarse !== PermissionsAndroid.RESULTS.GRANTED
  ) {
    return false;
  }

  if (Platform.Version >= 29) {
    const background = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
    );
    if (background !== PermissionsAndroid.RESULTS.GRANTED) {
      return false;
    }
  }

  return true;
};
