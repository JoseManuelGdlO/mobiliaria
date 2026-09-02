import React, {useEffect, useRef, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Navigation from '../../navigation/navigation';
import {AppState, View} from 'react-native';
import {useTheme} from '../../hooks/useTheme';
import {Provider as PaperProvider} from 'react-native-paper';
import {Host} from 'react-native-portalize';
import useSessionBootstrap from '@hooks/useSessionBootstrap';
import { ensureValidAccessToken } from '@services/sessionAuth';

const ConnectedApp = (): JSX.Element => {
  const navigationRef = useRef(null);
  const {navigationTheme, paperTheme} = useTheme();
  const sessionReady = useSessionBootstrap();

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        ensureValidAccessToken().catch(() => {});
      }
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!sessionReady) {
    return null;
  }

  return (
    <PaperProvider theme={paperTheme}>
      <View style={{
        flex: 1
      }}>
        <NavigationContainer ref={navigationRef} theme={navigationTheme}>
          <Host>
            <Navigation />
          </Host>
        </NavigationContainer>
      </View>
    </PaperProvider>
  );
};

export default ConnectedApp;
