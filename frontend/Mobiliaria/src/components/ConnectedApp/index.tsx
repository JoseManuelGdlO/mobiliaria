import React, {useEffect, useRef, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Navigation from '../../navigation/navigation';
import {AppState, Text, View} from 'react-native';
import {useTheme} from '../../hooks/useTheme';
import {Provider as PaperProvider} from 'react-native-paper';
import {Host} from 'react-native-portalize';

const ConnectedApp = (): JSX.Element => {
  const navigationRef = useRef(null);
  const {navigationTheme, paperTheme} = useTheme();

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

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
