import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const userEmail = await AsyncStorage.getItem('email');
      if (userEmail) {
        try {
          const response = await axios.get(`https://prioritotask.onrender.com/notifications?userEmail=${userEmail}`);
          setNotifications(response.data);
        } catch (error) {
          console.error('Error fetching notifications:', error.message);
        }
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 6000); // Fetch every 60 seconds
    return () => clearInterval(intervalId);
  }, []);

  const addNotification = async (message) => {
    const userEmail = await AsyncStorage.getItem('email');
    if (userEmail) {
      try {
        const response = await axios.post('https://prioritotask.onrender.com/notifications', { message, userEmail });
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          response.data,
        ]);
      } catch (error) {
        console.error('Error saving notification:', error.message);
      }
    }
  };

  const removeNotification = async (id) => {
    try {
      await axios.delete(`https://prioritotask.onrender.com/notifications/${id}`);
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification._id !== id)
      );
    } catch (error) {
      console.error('Error removing notification:', error.message);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
