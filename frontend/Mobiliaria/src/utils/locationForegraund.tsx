import { IUser } from '@interfaces/user';
import Geolocation from '@react-native-community/geolocation';
import { AppState, AppStateStatus, Platform } from 'react-native';
import BackgroundService from 'react-native-background-actions';
import { io } from 'socket.io-client';
import { ensureSocketUrl } from './remote-config';
import { ensureLocationPermissions } from './location-permissions';

Geolocation.setRNConfiguration({
  authorizationLevel: 'whenInUse',
  skipPermissionRequests: false,
  enableBackgroundLocationUpdates: false,
  locationProvider: 'auto'
});

type StartOptions = {
  token?: string;
};

let socketInstance: any = null;
let watchId: number | null = null;
let appStateSub: { remove: () => void } | null = null;
let startedForUserId: number | null = null;
let lastEmitAt = 0;

const shouldEmitNow = (coords: any) => {
  const now = Date.now();
  const accuracy = Number(coords?.accuracy ?? 0);
  if (accuracy > 120) return false;
  if (now - lastEmitAt < 8000) return false;
  lastEmitAt = now;
  return true;
};

const emitLocation = (user: IUser, location: any) => {
  if (!socketInstance || !socketInstance.connected) return;
  const payload = {
    type: 'location:update',
    user,
    location,
    sentAt: Date.now(),
  };
  socketInstance.emit('location:update', payload);
};

const startWatch = (user: IUser) => {
  if (watchId != null) {
    Geolocation.clearWatch(watchId);
  }
  watchId = Geolocation.watchPosition(
    (position) => {
      if (!shouldEmitNow(position?.coords)) return;
      emitLocation(user, position);
    },
    (error) => {
      console.log('location watch error', error);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 15,
      interval: 10000,
      fastestInterval: 7000,
      maximumAge: 5000,
    }
  );
};

export const stopLocationWS = async (): Promise<void> => {
  if (watchId != null) {
    Geolocation.clearWatch(watchId);
    watchId = null;
  }
  if (appStateSub != null) {
    appStateSub.remove();
    appStateSub = null;
  }
  if (socketInstance != null) {
    socketInstance.disconnect();
    socketInstance = null;
  }
  startedForUserId = null;
  lastEmitAt = 0;
  if (BackgroundService.isRunning()) {
    await BackgroundService.stop();
  }
};

export const sendLocationWS = async (user: IUser, options?: StartOptions) => {
  if (startedForUserId === user.id_usuario && socketInstance != null) {
    return stopLocationWS;
  }

  await stopLocationWS();
  const hasPermission = await ensureLocationPermissions();
  if (!hasPermission) return stopLocationWS;

  const socketUrl = await ensureSocketUrl();
  socketInstance = io(socketUrl, {
    transports: ['websocket'],
    timeout: 10000,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1500,
    auth: options?.token ? { token: options.token } : undefined,
  });

  socketInstance.on('connect', () => console.log('Websocket connected'));
  socketInstance.on('connect_error', (error: any) => console.log('socket connect_error', error?.message || error));
  socketInstance.on('error', (error: any) => console.log('socket error', error));

  startWatch(user);
  appStateSub = AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'active') {
      startWatch(user);
      return;
    }
    if (watchId != null) {
      Geolocation.clearWatch(watchId);
      watchId = null;
    }
  });

  if (Platform.OS === 'android' && Platform.Version < 34) {
    try {
      await BackgroundService.start(async () => {}, {
        taskName: 'Location',
        taskTitle: 'Compartiendo ubicación',
        taskDesc: 'Tu ubicación está activa para entregas en tiempo real',
        taskIcon: { name: 'ic_launcher', type: 'mipmap' },
        color: '#7b4cff',
        linkingURI: 'eventivapp://',
        parameters: {},
      });
    } catch (e) {
      console.log('background start warning', e);
    }
  }

  startedForUserId = user.id_usuario;
  return stopLocationWS;
};