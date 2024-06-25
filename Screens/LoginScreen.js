import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        navigation.replace("Main");
      }
    };
    checkToken();
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      return () => {
     setEmail('');
     setPassword('');
      };
    }, [])
  );

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("http://192.168.29.252:5000/login", {
        email,
        password,
      });
      setTimeout(async () => {
        setLoading(false);
        if (response.status === 200) {
          await AsyncStorage.setItem("token", response.data.token);
          await AsyncStorage.setItem("email", email);
          navigation.navigate("Main");
          setEmail("");
          setPassword("");
        }
      }, 2000);
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", error.response.data || "Invalid email or password");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={
          !showPassword
            ? require("../Images/monkeyeyeclosed.jpg")
            : require("../Images/monkeyeyeopen.png")
        }
        style={styles.monkeyImage}
      />
      <Text style={styles.title}>Welcome User</Text>
      <View style={styles.inputContainer}>
        <Icon name="mail" size={20} color="#333" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <Icon name="lock-closed" size={20} color="#333" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Icon
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#333"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  monkeyImage: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
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
  button: {
    height: 50,
    backgroundColor: "#007BFF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  forgotPasswordText: {
    color: "blue",
    textDecorationLine: "underline",
    textAlign: "center",
    marginBottom: 20,
  },
  registerText: {
    textAlign: "center",
    color: "#3498db",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
