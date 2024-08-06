import { IUser } from '@interfaces/user';
import Geolocation from '@react-native-community/geolocation';
import BackgroundService from 'react-native-background-actions';

export const sendLocationWS = async (user: IUser) => {
  const websocket = new WebSocket('ws://192.168.0.21:3000');

  websocket.onopen = () => {
    console.log('Conectado al servidor WebSocket');
  };

  websocket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  websocket.onclose = () => {
    console.log('Desconectado del servidor WebSocket');
  };

  Geolocation.setRNConfiguration({
    authorizationLevel: 'always', // Request "always" location permission
    skipPermissionRequests: false, // Prompt for permission if not granted
  });

  Geolocation.watchPosition(info => {
    // console.log('r', info);
    // websocket.send(JSON.stringify({
    //   user: user,
    //   lat: info.coords.latitude,
    //   lng: info.coords.longitude,
    // }));
  },
    error => {
      console.log(error);
    },
    {
      distanceFilter: 10, // Minimum distance (in meters) to update the location
      interval: 900000, // Update interval (in milliseconds), which is 15 minutes
      fastestInterval: 300000, // Fastest update interval (in milliseconds)
      accuracy: {
        android: 'highAccuracy',
        ios: 'best',
      },
      showsBackgroundLocationIndicator: true,
      pausesLocationUpdatesAutomatically: false,
      activityType: 'fitness', // Specify the activity type (e.g., 'fitness' or 'other')
      useSignificantChanges: false,
      deferredUpdatesInterval: 0,
      deferredUpdatesDistance: 0,
      foregroundService: {
        notificationTitle: 'Tracking your location',
        notificationBody: 'Enable location tracking to continue', // Add a notification body
      }
    });


  return () => {
    websocket.close();
  };
}