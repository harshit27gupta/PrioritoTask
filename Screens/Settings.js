import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity, Pressable, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from "expo-image-picker";
import * as Animatable from 'react-native-animatable';
import { CommonActions } from '@react-navigation/native';
import { useNotification } from '../NotificationContext';
const SettingsScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const navigation = useNavigation();
  const viewRef = useRef(null);
  const { addNotification } = useNotification();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = await AsyncStorage.getItem('email');
        const response = await axios.get(`http://192.168.29.252:5000/user?email=${email}`);
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
      await axios.put('http://192.168.29.252:5000/update-user', updatedUserData);
      setUserData(updatedUserData);
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully');
      addNotification("Profile updated successfully");
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
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                })
              );
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
        addNotification("Updated profile photo");
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
      <ImageBackground 
        source={require('../Images/wallpaperprofile.jpg')} 
        style={styles.headerImage} 
      >
        <View style={styles.overlay}>
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
              value={editMode ? userData.name : userData.name}
              onChangeText={(text) => setUserData({ ...userData, name: text })}
              editable={editMode}
              placeholder="Name"
            />
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={userData.email}
              editable={false}
              placeholder="Email"
            />
            <TextInput
              style={[styles.input, !editMode && styles.disabledInput]}
              value={editMode ? userData.mobileNumber : userData.mobileNumber}
              onChangeText={(text) => setUserData({ ...userData, mobileNumber: text })}
              editable={editMode}
              placeholder="Contact"
            />
            <TextInput
              style={[styles.input, !editMode && styles.disabledInput]}
              value={editMode ? userData.city : userData.city}
              onChangeText={(text) => setUserData({ ...userData, city: text })}
              editable={editMode}
              placeholder="City"
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
        </View>
      </ImageBackground>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Semi-transparent overlay
    padding: 20,
  },
  profilePhotoSection: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  profilePhotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
});

export default SettingsScreen;
