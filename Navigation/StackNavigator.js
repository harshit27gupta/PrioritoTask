import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../Screens/LoginScreen";
import RegisterScreen from "../Screens/RegisterScreen";
import VerifyEmailScreen from "../Screens/VerifyEmailScreen";
import ForgotPasswordScreen from "../Screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../Screens/ResetPasswordScreen";
import DashboardScreen from "../Screens/DashboardScreen";
import AboutScreen from "../Screens/AboutScreen";
import MissedTasksScreen from "../Screens/MissedTasksScreen";
import DoneTasksScreen from "../Screens/DoneTasksScreen";
import TaskCreationScreen from "../Screens/TaskCreationScreen";
import TaskListScreen from "../Screens/TaskListScreen";
import Settings from "../Screens/Settings";
import CalendarScreen from "../Screens/CalenderScreen";
import NotificationScreen from "../Screens/NotificationScreen";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator initialRouteName="Dashboard">
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Calender" component={CalendarScreen}/>
      <Drawer.Screen name="MissedTasks" component={MissedTasksScreen} />
      <Drawer.Screen name="TaskList" component={TaskListScreen} />
      <Drawer.Screen name="DoneTasks" component={DoneTasksScreen} />
      <Drawer.Screen name="About" component={AboutScreen} />
      <Drawer.Screen name="notifications" component={NotificationScreen}/>
      <Drawer.Screen name="Profile" component={Settings}/>
   
    </Drawer.Navigator>
  );
};

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerTitle: "Login",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerTitle: "Registration",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen
        name="Main"
        component={DrawerNavigator}
        options={{
          headerShown: false, 
        }}
      />
      <Stack.Screen name="TaskCreation" component={TaskCreationScreen} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
