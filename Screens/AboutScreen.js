import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const AboutScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>About This App</Text>
      <Text style={styles.subtitle}>App Purpose</Text>
      <Text style={styles.text}>
        This app is designed to help users manage their tasks efficiently. Users can add tasks, set due dates, and receive reminders for tasks that are due soon or overdue.
      </Text>
      <Text style={styles.subtitle}>Features</Text>
      <Text style={styles.text}>
        - Add and manage tasks{'\n'}
        - Set due dates for tasks{'\n'}
        - Receive email reminders for tasks{'\n'}
        - View notifications for due and overdue tasks
      </Text>
      <Text style={styles.subtitle}>App Version</Text>
      <Text style={styles.text}>1.0.0</Text>
      <Text style={styles.subtitle}>Developer</Text>
      <Text style={styles.text}>Harshit Gupta</Text>
      <Text style={styles.subtitle}>Contact</Text>
      <Text style={styles.text}>Email: harshit.raj2023@gmail.com</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#007BFF',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});

export default AboutScreen;
