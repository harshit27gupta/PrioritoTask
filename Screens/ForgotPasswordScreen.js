import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, Image } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const navigation = useNavigation();

  const handleForgotPassword = async () => {
    if(!email){
      Alert.alert('Alert','Please enter your email address');
      return;
    }
    try {
      const response = await axios.post('https://prioritotask.onrender.com/forgot-password', { email });
      if (response.status === 200) {
        setIsVerified(true);
        setTimeout(() => {
          setIsVerified(false);
          Alert.alert('Success', 'OTP sent to email');
          navigation.replace('ResetPassword', { email });
        }, 2000); // Duration of the animation
      }
    } catch (error) {
      Alert.alert('Error', error.response.data || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../Images/reset.jpg')} style={styles.image} />
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>Don't worry, we got you. Please enter the email you used to register.</Text>
      <View style={styles.inputContainer}>
        <Icon name="mail-outline" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#aaa"
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
        <Text style={styles.buttonText}>Verify</Text>
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
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#333',
  },
  icon: {
    marginRight: 10,
  },
  button: {
    height: 50,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
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

export default ForgotPasswordScreen;
