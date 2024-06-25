import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Animated, Easing } from 'react-native';
import { useNotification } from '../NotificationContext';
import { MaterialIcons } from '@expo/vector-icons';

const NotificationScreen = () => {
  const { notifications, removeNotification } = useNotification();
  const fadeAnim = new Animated.Value(1); // Initial opacity value for animations

  const handleRemoveNotification = async (id) => {
    try {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(async () => {
        await removeNotification(id);
        Alert.alert('Success', 'Notification removed successfully');
        fadeAnim.setValue(1);
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to remove notification');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications.slice().reverse()} 
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <Animated.View style={[styles.notification, { opacity: fadeAnim }]}>
            <View style={styles.notificationContent}>
              <MaterialIcons name="notifications" size={24} color="#fff" style={styles.icon} />
              <Text style={styles.notificationText}>{item.message}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemoveNotification(item._id)} style={styles.closeButton}>
              <MaterialIcons name="close" size={20} color="#007BFF" />
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  notification: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 }, // For iOS shadow
    shadowOpacity: 0.25, // For iOS shadow
    shadowRadius: 3.84, // For iOS shadow
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  notificationText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Roboto', // Use a modern font
  },
  closeButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 5,
  },
});

export default NotificationScreen;
