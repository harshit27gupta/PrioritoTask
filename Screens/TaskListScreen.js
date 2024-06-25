import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, Animated, Easing } from 'react-native';
import { Searchbar, Button, Card, Text, Chip } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TaskListScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('');

  const blinkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchTasks = async () => {
      const userEmail = await AsyncStorage.getItem('email');
      const response = await axios.get(`http://192.168.29.252:5000/alltasks?userEmail=${userEmail}`);
      setTasks(response.data);
    };

    fetchTasks();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 750,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 750,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const intervalId = setInterval(fetchTasks, 600);
    return () => clearInterval(intervalId);
  }, [blinkAnim]);

  const filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const getStatusPriority = (status) => {
    switch (status) {
      case 'in-progress':
        return 1;
      case 'not-done':
        return 2;
      case 'done':
        return 3;
      default:
        return 4;
    }
  };

  const sortedTasks = filteredTasks.sort((a, b) => {
    const statusPriorityA = getStatusPriority(a.status);
    const statusPriorityB = getStatusPriority(b.status);
    
    if (statusPriorityA !== statusPriorityB) {
      return statusPriorityA - statusPriorityB;
    }

    if (sort === 'dueDate') {
      const dateComparison = new Date(a.dueDate) - new Date(b.dueDate);
      if (dateComparison !== 0) return dateComparison; 
      return b.priority - a.priority;
    } else if (sort === 'priority') {
      const priorityComparison = b.priority - a.priority;
      if (priorityComparison !== 0) return priorityComparison;
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else {
      return 0;
    }
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'done':
        return styles.done;
      case 'in-progress':
        return { ...styles.inProgress, opacity: blinkAnim };
      case 'not-done':
        return styles.notDone;
      default:
        return {};
    }
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search tasks..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchbar}
      />
      <View style={styles.filterSortContainer}>
        <Button mode="contained" onPress={() => setSort('dueDate')} style={styles.button}>
          Sort by Due Date
        </Button>
        <Button mode="contained" onPress={() => setSort('priority')} style={styles.button}>
          Sort by Priority
        </Button>
      </View>
      <FlatList
        data={sortedTasks}
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
              <Animated.Text style={[styles.status, getStatusStyle(item.status)]}>
                {item.status === 'done' ? 'Completed' : item.status === 'in-progress' ? 'In Progress' : 'Not Done'}
              </Animated.Text>
            </Card.Content>
          </Card>
        )}
        keyExtractor={item => item._id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  searchbar: { marginBottom: 10 },
  filterSortContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  button: { marginHorizontal: 20 },
  card: { marginBottom: 10 },
  labelsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  chip: { margin: 2 },
  status: { marginTop: 5, fontWeight: 'bold' },
  done: { color: 'green' },
  inProgress: { color: 'orange' },
  notDone: { color: 'red' },
});

export default TaskListScreen;
