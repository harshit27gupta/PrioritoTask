import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import StackNavigator from './Navigation/StackNavigator';
import { NotificationProvider } from './NotificationContext';
import SplashScreen from './SplashScreen';

export default function App() {
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  const handleSplashFinish = () => {
    setIsSplashFinished(true);
  };

  if (!isSplashFinished) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <NotificationProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </NotificationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
