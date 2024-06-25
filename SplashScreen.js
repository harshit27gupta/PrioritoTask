import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Audio } from 'expo-av';

const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    // Load and play the sound
    const playSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/AppSound.mp3')
      );
      await sound.playAsync();
      // Sound will automatically unload after playing
    };

    playSound();

    // Set a timeout for the duration of the animation
    const timeout = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3000); // Match this duration with your animation duration

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        source={require('./assets/Animated.json')}
        autoPlay
        loop={false}
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  animation: {
    width: 200,
    height: 200,
  },
});

export default SplashScreen;
