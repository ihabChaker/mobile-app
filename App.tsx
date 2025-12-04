import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store, persistor } from './src/store/store';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from './src/theme';
import { ErrorBoundary } from './src/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <Provider store={store}>
          <PersistGate
            loading={
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            }
            persistor={persistor}
          >
            <SafeAreaProvider>
              <RootNavigator />
              <StatusBar style="dark" />
            </SafeAreaProvider>
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
