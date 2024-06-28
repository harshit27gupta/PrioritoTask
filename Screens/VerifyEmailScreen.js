import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const VerifyEmailScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(15);
  const route = useRoute();
  const navigation = useNavigation();
  const { email } = route.params;
  const otpInputs = useRef([]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(timer - 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    try {
      const otpValue = otp.join('');
      const response = await axios.post('http://192.168.29.252:5000/verify', { email, otp: otpValue });
      if (response.status === 200) {
        Alert.alert('Success', 'Email verified successfully');
        navigation.navigate('Login');
      }
    } catch (error) {
      Alert.alert('Error', error.response.data || 'Something went wrong');
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await axios.post('http://192.168.29.252:5000/generate-otp', { email });
      if (response.status === 200) {
        Alert.alert('Success', 'OTP resent successfully');
        setTimer(15);
        // Clear OTP input fields
        setOtp(['', '', '', '', '', '']);
        // Focus on the first input field
        if (otpInputs.current[0]) {
          otpInputs.current[0].focus();
        }
      }
    } catch (error) {
      Alert.alert('Error', error.response.data || 'Something went wrong');
    }
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input on entering a digit
    if (value && index < otp.length - 1) {
      otpInputs.current[index + 1].focus();
    }

    // Move to previous input on deleting a digit
    if (!value && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  return (
    <ImageBackground source={require('../Images/success.jpg')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Text style={styles.title}>Verify Email</Text>
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (otpInputs.current[index] = ref)}
              style={styles.otpInput}
              value={digit}
              onChangeText={(text) => handleOtpChange(index, text)}
              maxLength={1}
              keyboardType="numeric"
              autoFocus={index === 0 ? true : false}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleVerify}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive an OTP?</Text>
          <TouchableOpacity onPress={handleResendOtp} disabled={timer > 0}>
            <Text style={styles.resendButton}>{timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { 
    flex: 1, 
    width: '100%', 
    height: '100%' 
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Adding a semi-transparent background
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 18,
    backgroundColor: '#fff',
  },
  button: {
    height: 50,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    marginRight: 5,
  },
  resendButton: {
    fontSize: 16,
    color: '#3498db',
    textDecorationLine: 'underline',
  },
});

export default VerifyEmailScreen;