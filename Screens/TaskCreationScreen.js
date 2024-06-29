import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, FlatList, ImageBackground } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Animatable from 'react-native-animatable';
import { useNotification } from '../NotificationContext';

const suggestions = [
  "Grocery Shopping", "Meeting with Bob", "Doctor Appointment",
  "Project Deadline", "Pick up Kids", "Gym Session", "Read Book",
  "Finish Homework", "Call Mom", "Dinner with Friends"
];

const TaskCreationScreen = ({ route, navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(route.params?.selectedDate ? new Date(route.params.selectedDate) : null);
  const [priority, setPriority] = useState(1);
  const [category, setCategory] = useState('');
  const [labels, setLabels] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(suggestions);
  const { addNotification } = useNotification();

  const handleTitleChange = (text) => {
    setTitle(text);
    setFilteredSuggestions(suggestions.filter(suggestion => suggestion.toLowerCase().includes(text.toLowerCase())));
  };

  const selectSuggestion = (title) => {
    setTitle(title);
    setFilteredSuggestions(suggestions);
  };

  const handleSaveTask = async () => {
    if (!title || !description || !dueDate) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Alert.alert(
      'Confirmation',
      'You cannot change your priority and due date afterwards. Are you sure?',
      [
        {
          text: 'Disagree',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Agree',
          onPress: async () => {
            setLoading(true);
            try {
              const email = await AsyncStorage.getItem('email');
              const response = await axios.post('https://prioritotask.onrender.com/tasks', {
                title,
                description,
                dueDate,
                priority,
                category,
                labels: labels.split(','),
                userEmail: email,
              });
              if (response.status === 200) {
                addNotification("New task created successfully");
                Alert.alert('Success', 'Task created successfully');
                navigation.goBack();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to create task');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dueDate;
    const today = new Date();
    if (currentDate < today) {
      Alert.alert('Invalid Date', 'Please select a date that is not earlier than today');
      return;
    }
    setShowDatePicker(false);
    setDueDate(currentDate);
  };

  return (
    <ImageBackground
      source={require('../Images/taskcreation.jpg')}
      style={styles.backgroundImage}
      blurRadius={2}
    >
      <View style={styles.overlay} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Create Task</Text>
        
        <Text style={styles.label}>Suggested</Text>
        <FlatList
          data={filteredSuggestions}
          horizontal
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => selectSuggestion(item)} style={styles.suggestionCard}>
              <Animatable.Text animation="fadeIn" style={styles.suggestionText}>{item}</Animatable.Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.suggestionsContainer}
          showsHorizontalScrollIndicator={false}
        />

        <Animatable.View animation="fadeInUp" style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={handleTitleChange}
            placeholderTextColor="black"
          />
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={100} style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            placeholderTextColor="black"
          />
        </Animatable.View>

        <Text style={styles.label}>Due Date</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>
            {dueDate ? dueDate.toLocaleDateString() : 'Select Due Date'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityContainer}>
          <TouchableOpacity onPress={() => setPriority(1)} style={[styles.priorityButton, priority === 1 && styles.selectedPriority]}>
            <Text style={styles.priorityText}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPriority(2)} style={[styles.priorityButton, priority === 2 && styles.selectedPriority]}>
            <Text style={styles.priorityText}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPriority(3)} style={[styles.priorityButton, priority === 3 && styles.selectedPriority]}>
            <Text style={styles.priorityText}>3</Text>
          </TouchableOpacity>
        </View>

        <Animatable.View animation="fadeInUp" delay={200} style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Category"
            value={category}
            onChangeText={setCategory}
            placeholderTextColor="black"
          />
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={300} style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Labels (comma separated)"
            value={labels}
            onChangeText={setLabels}
            placeholderTextColor="black"
          />
        </Animatable.View>

        <TouchableOpacity style={styles.button} onPress={handleSaveTask} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Animatable.Text animation="pulse" easing="ease-out" iterationCount="infinite" style={styles.buttonText}>Save Task</Animatable.Text>}
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    color: '#333',
    fontWeight:'700'
  },
  dateButton: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  priorityButton: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPriority: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
     fontWeight:'700'
  },
  priorityText: {
    fontSize: 18,
    color: '#fff',
     fontWeight:'700'
  },
  button: {
    height: 50,
    backgroundColor: '#007BFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  suggestionCard: {
    backgroundColor: '#007BFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  suggestionText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default TaskCreationScreen;
