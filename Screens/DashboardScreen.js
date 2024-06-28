import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotification } from '../NotificationContext';
import LottieView from 'lottie-react-native';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const userEmail = await AsyncStorage.getItem('email');
        const response = await axios.get(`http://192.168.29.252:5000/tasks?userEmail=${userEmail}`);
        setTasks(response.data);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
    const intervalId = setInterval(fetchTasks, 6000);
    return () => clearInterval(intervalId);
  }, []);

  const renderTask = ({ item }) => {
    const isEditing = editingTask && editingTask.title === item.title;

    return (
      <View style={styles.taskItem}>
        <View style={styles.taskHeader}>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholder="Title"
            />
          ) : (
            <Text style={styles.taskTitle}>{item.title}</Text>
          )}
          <TouchableOpacity onPress={() => toggleEditTask(item)}>
            <Icon name="ellipsis-vertical" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={taskDescription}
            onChangeText={setTaskDescription}
            placeholder="Description"
          />
        ) : (
          <Text style={styles.taskDescription}>{item.description}</Text>
        )}
        <View style={styles.taskFooter}>
          <Text style={styles.taskDetails}>Due: {formatDueDate(item.dueDate)}</Text>
          <Text style={styles.taskDetails}>Priority: {getPriorityLabel(item.priority)}</Text>
          <TouchableOpacity onPress={() => confirmDeleteTask(item)}>
            <Icon name="trash" size={24} color="red" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => confirmMarkAsDone(item)} style={styles.markAsDoneButton}>
          <Icon name={item.status === 'done' ? "checkmark-circle" : "ellipse-outline"} size={24} color={item.status === 'done' ? "green" : "#ccc"} />
        </TouchableOpacity>
        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveTask}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const formatDueDate = (dueDate) => {
    const date = new Date(dueDate);
    const currentDate = new Date();
    const tomorrowDate = new Date();
    tomorrowDate.setDate(currentDate.getDate() + 1);

    if (date.toDateString() === currentDate.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrowDate.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 1:
        return 'Low';
      case 2:
        return 'Medium';
      case 3:
        return 'High';
      default:
        return '';
    }
  };

  const toggleEditTask = (task) => {
    if (editingTask && editingTask.title === task.title) {
      setEditingTask(null);
    } else {
      setEditingTask(task);
      setTaskTitle(task.title);
      setTaskDescription(task.description);
    }
  };

  const handleSaveTask = async () => {
    const userEmail = await AsyncStorage.getItem('email');
    const { title } = editingTask;

    try {
      const response = await axios.put(`http://192.168.29.252:5000/tasks`, {
        title,
        userEmail,
        newTitle: taskTitle,
        newDescription: taskDescription,
      });

      const updatedTask = response.data;
      setTasks(tasks.map(t => (t.title === title ? updatedTask : t)));
      Alert.alert('Success', 'Task updated successfully');
      addNotification("Task edited successfully");
      setEditingTask(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const confirmDeleteTask = (task) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => handleDeleteTask(task) },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteTask = async (task) => {
    const userEmail = await AsyncStorage.getItem('email');
    const { title } = task;

    try {
      await axios.delete(`http://192.168.29.252:5000/tasks`, { data: { title, userEmail } });
      setTasks(tasks.filter(t => t.title !== task.title));
      Alert.alert('Success', 'Task deleted successfully');
      addNotification("Task deleted successfully");
    } catch (error) {
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  const confirmMarkAsDone = (task) => {
    Alert.alert(
      'Mark as Done',
      'Are you sure you did your task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => handleMarkAsDone(task) },
      ],
      { cancelable: false }
    );
  };

  const handleMarkAsDone = async (task) => {
    const userEmail = await AsyncStorage.getItem('email');
    const { title } = task;

    try {
      const response = await axios.put(`http://192.168.29.252:5000/mark-done`, {
        title,
        userEmail,
      });

      const updatedTask = response.data;
      setTasks(tasks.map(t => (t.title === title ? updatedTask : t)));
      Alert.alert('Success', 'Task marked as done');
      addNotification("You successfully did your task");
    } catch (error) {
      Alert.alert('Error', 'Failed to mark task as done');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Upcoming Tasks</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : tasks.length > 0 ? (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.title}
        />
      ) : (
        <Text style={styles.emptyState}>No upcoming tasks</Text>
      )}
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('TaskCreation')}>
        <Icon name="add-circle" size={60} color="#007BFF" />
      </TouchableOpacity>

      <Modal visible={isVerified} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <LottieView
            source={require('../assets/success.json')}
            autoPlay
            loop={false}
            style={styles.lottieAnimation}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  heading: {
    fontSize: 28,
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
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    color: '#555',
  },
  emptyState: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  markAsDoneButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  saveButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },
});

export default DashboardScreen;
