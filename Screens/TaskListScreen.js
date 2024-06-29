import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, Animated, Easing, ImageBackground } from 'react-native';
import { Searchbar, Button, Card, Text, Chip } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';

const TaskListScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('');

  const blinkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const userEmail = await AsyncStorage.getItem('email');
        const response = await axios.get(`https://prioritotask.onrender.com/alltasks?userEmail=${userEmail}`);
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
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

    const intervalId = setInterval(fetchTasks, 60000); // Fetch tasks every 60 seconds
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
    if (sort === 'dueDate') {
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else if (sort === 'priority') {
      return b.priority - a.priority;
    } else {
      const statusPriorityA = getStatusPriority(a.status);
      const statusPriorityB = getStatusPriority(b.status);
      return statusPriorityA - statusPriorityB;
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
    <ImageBackground source={require('../Images/tasks.jpeg')} style={styles.backgroundImage}>
      <BlurView intensity={50} style={styles.blurContainer}>
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
      </BlurView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  blurContainer: { flex: 1 },
  container: { flex: 1, padding: 10 },
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
