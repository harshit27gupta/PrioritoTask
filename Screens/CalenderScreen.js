import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ImageBackground, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import { useFocusEffect } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

const CalendarScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState({});
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    fetchTasks();
    const intervalId = setInterval(fetchTasks, 600);
    return () => clearInterval(intervalId);
  }, []);

  const fetchTasks = async () => {
    try {
      const userEmail = await AsyncStorage.getItem('email');
      const response = await axios.get(`https://prioritotask.onrender.com/alltasks?userEmail=${userEmail}`);
      const tasksData = response.data.reduce((acc, task) => {
        const date = task.dueDate.split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(task);
        return acc;
      }, {});
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error.message);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setSelectedDate('');
    }, [])
  );

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  return (
    <ImageBackground source={require('../Images/clouds.jpeg')} style={styles.backgroundImage}>
      <BlurView intensity={40} style={styles.blurContainer}>
        <Animatable.View animation="fadeInUp" style={styles.innerContainer}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={{
              ...Object.keys(tasks).reduce((acc, date) => {
                acc[date] = { marked: true, dotColor: 'red' };
                return acc;
              }, {}),
              [selectedDate]: { selected: true, marked: true, selectedColor: 'blue' },
            }}
            theme={{
              calendarBackground: 'transparent', // Make calendar background transparent to show the image
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: '#00adf5',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#00adf5',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#00adf5',
              selectedDotColor: '#ffffff',
              arrowColor: 'orange',
              monthTextColor: 'blue',
              indicatorColor: 'blue',
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
          />

          {selectedDate && (
            <Animatable.View animation="fadeIn" duration={500}>
              <FlatList
                data={tasks[selectedDate] || []}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <View style={styles.taskItem}>
                    <Text style={styles.taskTitle}>{item.title}</Text>
                    <Text>{item.description}</Text>
                    <Text>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
                    <Text>Priority: {item.priority}</Text>
                    <Text>Status: {item.status}</Text>
                  </View>
                )}
              />
            </Animatable.View>
          )}

          {selectedDate && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('TaskCreation', { selectedDate })}
            >
              <Animatable.Text animation="pulse" iterationCount="infinite" style={styles.addButtonText}>
                Mark This Date
              </Animatable.Text>
            </TouchableOpacity>
          )}
        </Animatable.View>
      </BlurView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  blurContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Optional: Adjust for better readability
  },
  taskItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  taskTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    position: 'absolute',
    bottom: 30,
    right: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2.62,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default CalendarScreen;
