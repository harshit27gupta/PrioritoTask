import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ImageBackground } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';

const MissedTasksScreen = () => {
  const [missedTasks, setMissedTasks] = useState([]);

  useEffect(() => {
    const fetchMissedTasks = async () => {
      try {
        const userEmail = await AsyncStorage.getItem('email');
        const response = await axios.get(`http://192.168.29.252:5000/alltasks?userEmail=${userEmail}`);
        const allTasks = response.data;
        
        const filteredTasks = allTasks.filter(task => task.status === "not done");
        setMissedTasks(filteredTasks);
      } catch (error) {
        console.error('Error fetching missed tasks:', error);
      }
    };

    fetchMissedTasks();
    const intervalId = setInterval(fetchMissedTasks, 600);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <ImageBackground source={require('../Images/calm.jpg')} style={styles.backgroundImage}>
      <BlurView intensity={50} style={styles.blurContainer}>
        <View style={styles.container}>
          {missedTasks.length === 0 ? (
            <Text style={styles.noTasksText}>No missed tasks</Text>
          ) : (
            <FlatList
              data={missedTasks}
              renderItem={({ item }) => (
                <Card style={styles.card}>
                  <Card.Title title={item.title} subtitle={`Due: ${new Date(item.dueDate).toLocaleDateString()}`} />
                  <Card.Content>
                    <Text>Priority: {item.priority}</Text>
                    <Text>Category: {item.category}</Text>
                    <View style={styles.labelsContainer}>
                      {item.labels.map((label, index) => (
                        <Chip key={index} style={styles.chip}>{label}</Chip>
                      ))}
                    </View>
                    <Text style={styles.missed}>Missed</Text>
                  </Card.Content>
                </Card>
              )}
              keyExtractor={item => item._id}
            />
          )}
        </View>
      </BlurView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  blurContainer: { flex: 1 },
  container: { flex: 1, padding: 10 },
  noTasksText: { textAlign: 'center', marginTop: 20, fontSize: 18, color: '#888' },
  card: { marginBottom: 10, borderWidth: 1, borderColor: '#ff0000' },
  labelsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  chip: { margin: 2 },
  missed: { color: 'red', fontWeight: 'bold', marginTop: 10 },
});

export default MissedTasksScreen;
