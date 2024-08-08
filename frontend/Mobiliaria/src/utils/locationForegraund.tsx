import { IUser } from '@interfaces/user';
import Geolocation from '@react-native-community/geolocation';
import { useState } from 'react';
import BackgroundService from 'react-native-background-actions';
import { io } from 'socket.io-client';

Geolocation.setRNConfiguration({
  authorizationLevel: 'always', // Request "always" location permission
  skipPermissionRequests: false, // Prompt for permission if not granted
  enableBackgroundLocationUpdates: true, // Enable or disable background location updates
  locationProvider: 'auto'
});

export const sendLocationWS = async (user: IUser) => {
  let location: any = null;
  let lastLocation: any = null
  const socket = io('http://192.168.0.21:3000');
  
  socket.on('connect', function () { 
    console.log('Websocket Connected with App');
  });

  socket.on('error', function (error: any) {
    console.log('error socket' , error);
    
  })

  socket.on('event', (msg) => { console.log('msg',msg)});


  const sleep = (time: any) => new Promise((resolve) => setTimeout(() => resolve(), time));

  // You can do anything in your task such as network requests, timers and so on,
  // as long as it doesn't touch UI. Once your task completes (i.e. the promise is resolved),
  // React Native will go into "paused" mode (unless there are other tasks running,
  // or there is a foreground app).
  const veryIntensiveTask = async (taskDataArguments: any) => {
    // Example of an infinite loop task
    const { delay } = taskDataArguments;
    await new Promise(async (resolve) => {
      for (let i = 0; BackgroundService.isRunning(); i++) {    
        // console.log(location, 'location');
            
        if (location) {
          lastLocation = location;
          // location.coords.longitude = '-104.6608'
          // location.coords.latitude = '24.0248'
          // user.id_usuario = 1
          socket.emit('location',{
            type: 'location',
            user: user,
            location: location
          });

        }
        await sleep(delay);
      }
    });
  };

  const options = {
    taskName: 'Location',
    taskTitle: 'obteniendo ubicación',
    taskDesc: 'Estamos obteniendo tu ubicación',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'eventivapp://', // See Deep Linking for more info
    parameters: {
      delay: 10000,
    },
  };

  Geolocation.getCurrentPosition(info => {
    location = info
  });


  await BackgroundService.start(veryIntensiveTask, options);

  return () => {
    socket.close();
  };
}