PrioritoTask!!
PrioritoTask is a modern, full-featured task management system designed to help users organize, 
prioritize, and complete their daily tasks efficiently. With a stunning mobile interface and a robust backend, 
PrioritoTask ensures you never miss a deadline and stay productive every day

✨ Features

User Registration & Authentication

Secure sign-up with email verification (OTP-based)

Login, password reset, and profile management

Task Management

Create, edit, and delete tasks with title, description, due date, priority, category, and labels

Mark tasks as done, view completed and missed tasks

Smart suggestions for task titles

Prioritization & Reminders

Set task priority (Low, Medium, High)

Receive email reminders for tasks due today, tomorrow, or overdue

In-app notifications for important events

Calendar Integration

Visualize tasks on a calendar

Quickly add or view tasks for any date

User Profile & Settings

Update profile details and change password

Upload a profile photo

Beautiful UI/UX

Animated splash screen, modern design, and smooth transitions

Themed backgrounds and blur effects for a delightful experience

Built with React Native and Expo for Android, iOS, and Web

Cross-Platform
🚀 Getting Started

Prerequisites

Node.js (v16+ recommended)

npm or yarn

MongoDB (local or cloud, e.g., MongoDB Atlas)

Expo CLI (npm install -g expo-cli)

1. Clone the Repository

git clone https://github.com/harshit27gupta/prioritotask.git
   
cd prioritotask

2. Backend Setup 

   cd api
   
npm install

Create a .env file in the api/ directory:

MONGO_URI=your_mongodb_connection_string

USER_EMAIL=your_gmail_address

USER_PASS=your_gmail_app_password

PORT=4000

Note: For email features, use a Gmail App Password (not your main password).

Start the backend server:

npm run dev

3. Frontend Setup
4. 
cd prioritotask

npm install

npm run start


Run on Android/iOS device or emulator, or open in web browser.
