import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from "expo-image-picker";
import * as Animatable from 'react-native-animatable';

const SettingsScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const navigation = useNavigation();
  const viewRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = await AsyncStorage.getItem('email');
        const response = await axios.get(`https://prioritotask-12.onrender.com/user?email=${email}`);
        const storedProfilePhoto = await AsyncStorage.getItem('profilePhoto');
        setUserData(response.data);
        if (storedProfilePhoto) {
          setProfilePhoto(storedProfilePhoto);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error.message);
        setLoading(false);
      }
    };

    fetchUserData();
    const intervalId = setInterval(fetchUserData, 6000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSave = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const email = await AsyncStorage.getItem('email');
      const updatedUserData = { ...userData, newPassword, email };
      await axios.put('https://prioritotask-12.onrender.com/update-user', updatedUserData);
      setUserData(updatedUserData);
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully');
      setLoading(false);
    } catch (error) {
      console.error('Error updating user data:', error.message);
      Alert.alert('Error', 'Failed to update profile');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'No',
          onPress: () => console.log('Logout cancelled'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            viewRef.current.fadeOut(500).then(async () => {
              await AsyncStorage.removeItem('token');
              navigation.navigate('Login');
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleProfileIconPress = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Sorry, we need camera roll permissions to make this work!"
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.canceled) {
        const source = { uri: result.assets[0].uri };
        setProfilePhoto(source.uri);
        await AsyncStorage.setItem('profilePhoto', source.uri);
      }
    } catch (error) {
      console.log("Error reading an image", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Animatable.View animation="fadeIn" ref={viewRef} style={styles.container}>
      <Pressable onPress={handleProfileIconPress}>
        <View style={styles.profilePhotoSection}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.profilePhotoPlaceholder}>
              <Text style={styles.profilePhotoPlaceholderText}>No Photo</Text>
            </View>
          )}
        </View>
      </Pressable>
      <View style={styles.profileSection}>
        <TextInput
          style={[styles.input, !editMode && styles.disabledInput]}
          value={editMode ? userData.name : `Name: ${userData.name}`}
          onChangeText={(text) => setUserData({ ...userData, name: text })}
          editable={editMode}
        />
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={`Email: ${userData.email}`}
          editable={false}
        />
        <TextInput
          style={[styles.input, !editMode && styles.disabledInput]}
          value={editMode ? userData.mobileNumber : `Contact: ${userData.mobileNumber}`}
          onChangeText={(text) => setUserData({ ...userData, mobileNumber: text })}
          editable={editMode}
        />
        <TextInput
          style={[styles.input, !editMode && styles.disabledInput]}
          value={editMode ? userData.city : `City: ${userData.city}`}
          onChangeText={(text) => setUserData({ ...userData, city: text })}
          editable={editMode}
        />
      </View>
      {editMode && (
        <>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </>
      )}
      <View style={styles.buttons}>
        {editMode ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  profilePhotoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profilePhotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePhotoPlaceholderText: {
    color: '#fff',
    fontSize: 16,
  },
  profileSection: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#e9e9e9',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex:     1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
});

export default SettingsScreen;

