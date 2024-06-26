import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MissedTasksScreen = () => {
  const [missedTasks, setMissedTasks] = useState([]);

  useEffect(() => {
    const fetchMissedTasks = async () => {
      const userEmail = await AsyncStorage.getItem('email');
      const response = await axios.get(`https://prioritotask-12.onrender.com/alltasks?userEmail=${userEmail}`);
      const allTasks = response.data;
      const currentDate = new Date();
  
  const startOfToday = new Date(currentDate.setHours(0, 0, 0, 0));

  const filteredTasks = allTasks.filter(task => {
    const taskDueDate = new Date(task.dueDate);
    const taskDueDateOnly = new Date(taskDueDate.setHours(0, 0, 0, 0));
    return taskDueDateOnly < startOfToday;
  });

    fetchMissedTasks();
    const intervalId = setInterval(fetchTasks, 600);
    return () => clearInterval(intervalId);
  }}, []);

  return (
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  noTasksText: { textAlign: 'center', marginTop: 20, fontSize: 18, color: '#888' },
  card: { marginBottom: 10, borderWidth: 1, borderColor: '#ff0000' },
  labelsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  chip: { margin: 2 },
  missed: { color: 'red', fontWeight: 'bold', marginTop: 10 },
});

export default MissedTasksScreen;
