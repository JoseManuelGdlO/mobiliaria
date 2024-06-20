/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import type { ReactElement } from 'react';
export { type RootState } from './src/redux/reducers'
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StatusBarStyle,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ConnectedApp from './src/components/ConnectedApp';
import { Provider } from 'react-redux';
import rootReducer, { persistor } from './src/redux/reducers'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PersistGate } from 'redux-persist/lib/integration/react';
// @ts-expect-error
import GlobalFont from 'react-native-global-font'


const MyStatusBar = ({ backgroundColor, barStyle, ...props }: { backgroundColor: string, barStyle: StatusBarStyle }): ReactElement => (
  <View style={{ height: StatusBar.currentHeight, backgroundColor }}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} barStyle={barStyle} />
    </SafeAreaView>
  </View>
)

const App = (): JSX.Element => {
  GlobalFont.applyGlobal('Inter')

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>

        <Provider store={rootReducer}>
          <PersistGate loading={null} persistor={persistor}>
            <MyStatusBar backgroundColor="#000" barStyle="light-content" />
            <SafeAreaProvider>
              <ConnectedApp />
            </SafeAreaProvider>
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    </>
  );
}

export default App;
