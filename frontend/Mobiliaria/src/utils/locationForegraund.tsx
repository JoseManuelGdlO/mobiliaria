import { IUser } from '@interfaces/user';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import { Alert } from 'react-native';

export const sendLocationWS = (user: IUser) => {
    const websocket = new WebSocket('wss://192.168.1.64:8000');

   
    websocket.onopen = () => {
        console.log('Conectado al servidor WebSocket');
      };
  
      websocket.onmessage = (event) => {
        console.log('Mensaje recibido del serviidor:', event.data);
      };
  
      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
  
      websocket.onclose = () => {
        console.log('Desconectado del servidor WebSocket');
      };

      BackgroundGeolocation.configure({
        desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
        stationaryRadius: 50,
        distanceFilter: 50,
        notificationTitle: 'Tracking',
        notificationText: 'Your location is being tracked',
        debug: false,
        startOnBoot: true,
        stopOnTerminate: false,
        locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
        interval: 10000, // Intervalo de 10 segundos para obtener la ubicación
        fastestInterval: 5000,
        activitiesInterval: 10000,
        stopOnStillActivity: false,
      });
  
      BackgroundGeolocation.on('location', (location) => {
        console.log('location send', location, websocket);
        
        // Enviar la ubicación al servidor WebSocket
        websocket.send(JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          user: user
        }));
  
      });
  
      BackgroundGeolocation.on('error', (error) => {
        console.log('[ERROR] BackgroundGeolocation error:', error);
      });
  
      BackgroundGeolocation.on('start', () => {
        console.log('[INFO] BackgroundGeolocation service has been started');
      });
  
      BackgroundGeolocation.on('stop', () => {
        console.log('[INFO] BackgroundGeolocation service has been stopped');
      });
  
      BackgroundGeolocation.on('authorization', (status) => {
        console.log('[INFO] BackgroundGeolocation authorization status: ', status);
        if (status !== BackgroundGeolocation.AUTHORIZED) {
          // Si no está autorizado, intenta pedir permisos
          setTimeout(() => {
            Alert.alert('App requires location tracking permission', 'Would you like to open app settings?', [
              { text: 'Yes', onPress: () => BackgroundGeolocation.showAppSettings() },
              { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' },
            ]);
          }, 1000);
        }
      });
  
      BackgroundGeolocation.on('background', () => {
        console.log('[INFO] App is in background');
      });
  
      BackgroundGeolocation.on('foreground', () => {
        console.log('[INFO] App is in foreground');
      });
  
      // Iniciar el servicio de ubicación en segundo plano
      BackgroundGeolocation.start();
  
      return () => {
        // Detener el servicio de ubicación cuando el componente se desmonte
        BackgroundGeolocation.stop();
        websocket.close();
      };
}