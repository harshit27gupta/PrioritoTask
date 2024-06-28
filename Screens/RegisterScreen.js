import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
  ImageBackground,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        clearFormFields();
      };
    }, [])
  );

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date ? date.toLocaleDateString(undefined, options) : 'Select Date of Birth';
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !dateOfBirth || !gender || !mobileNumber || !city) {
      Alert.alert('Error', 'Please fill all the fields');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://192.168.29.252:5000/register', {
        name,
        email,
        password,
        confirmPassword,
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : null, // Format the date to YYYY-MM-DD if not null
        mobileNumber,
        city,
        gender
      });
      setTimeout(() => {
        setLoading(false);
        if (response.status === 200) {
          Alert.alert('Success', 'Registered successfully. Check your email for the OTP.');
          navigation.replace('VerifyEmail', { email }); // Use replace instead of navigate
          clearFormFields();
        }
      }, 2000);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.response.data || 'Something went wrong');
    }
  };

  const clearFormFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDateOfBirth(null);
    setMobileNumber('');
    setCity('');
    setGender('');
  };

  return (
    <ImageBackground
      source={require('../Images/registerblur.jpg')}
      style={styles.backgroundImage}
      blurRadius={5}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>Register here</Text>
          <View style={styles.inputContainer}>
            <Icon name="person" size={20} color="#333" style={styles.icon} />
            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
          </View>
          <View style={styles.inputContainer}>
            <Icon name="mail" size={20} color="#333" style={styles.icon} />
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={styles.inputContainer}>
            <Icon name="lock-closed" size={20} color="#333" style={styles.icon} />
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#333" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Icon name="lock-closed" size={20} color="#333" style={styles.icon} />
            <TextInput style={styles.input} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Icon name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#333" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>{formatDate(dateOfBirth)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || dateOfBirth;
                setShowDatePicker(false);
                setDateOfBirth(currentDate);
              }}
            />
          )}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue, itemIndex) => setGender(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
          <View style={styles.inputContainer}>
            <Icon name="call" size={20} color="#333" style={styles.icon} />
            <TextInput style={styles.input} placeholder="Mobile Number" value={mobileNumber} onChangeText={setMobileNumber} keyboardType="phone-pad" />
          </View>
          <View style={styles.inputContainer}>
            <Icon name="home" size={20} color="#333" style={styles.icon} />
            <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login') }>
            <Text style={styles.registerText}>Already have an account? Sign in here</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)', // Adding a semi-transparent overlay
  },
  registerText: {
    textAlign: 'center',
    color: 'blue',
    textDecorationLine: 'underline',
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#fff', // Change text color for better contrast
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#333",
  },
  icon: {
    marginRight: 10,
  },
  eyeIcon: {
    padding: 5,
  },
  dateButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  dateButtonText: {
    color: 'white',
    fontSize: 18,
  },
  pickerContainer: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  picker: {
    width: '100%',
    color: '#333',
    
  },
  button: {
    height: 50,
    backgroundColor: "#007BFF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
