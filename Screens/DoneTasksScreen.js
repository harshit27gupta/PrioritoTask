import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DoneTasksScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDoneTasks = async () => {
    try {
      const userEmail = await AsyncStorage.getItem('email');
      const response = await axios.get(`http://192.168.29.252:5000/done-tasks?userEmail=${userEmail}`);
      setTasks(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch done tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDoneTasks();
    const intervalId = setInterval(fetchDoneTasks, 6000);
    return () => clearInterval(intervalId);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDoneTasks();
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskItem}>
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskDescription}>{item.description}</Text>
      <View style={styles.taskFooter}>
        <Text style={styles.taskDetails}>Done </Text>
        <TouchableOpacity onPress={() => handleDeleteTask(item)}>
          <Icon name="trash" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const formatTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString();
  };

  const handleDeleteTask = async (task) => {
    const userEmail = await AsyncStorage.getItem('email');
    const { title } = task;

    try {
      await axios.delete(`http://192.168.29.252:5000/tasks`, { data: { title, userEmail } });
      setTasks(tasks.filter(t => t.title !== task.title));
      Alert.alert('Success', 'Task deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Done Tasks</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : tasks.length > 0 ? (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.title}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <Text style={styles.emptyState}>No tasks marked as done</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  taskDescription: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDetails: {
    fontSize: 14,
    color: '#888',
  },
  emptyState: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default DoneTasksScreen;
