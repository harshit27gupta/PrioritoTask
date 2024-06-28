// index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const connectionsring="mongodb+srv://coderman2004:ZUYTsWPFBDK6avBx@managetasks.efpnxs6.mongodb.net/";
mongoose.connect( connectionsring, {
})
    .then(() => {console.log('MongoDB connected successfully')    
        
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    });
    const userSchema = new mongoose.Schema({
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        gender: { type: String, required: true },
        mobileNumber: { type: String, required: true },
        city: { type: String, required: true },
        isVerified: { type: Boolean, default: false }
    });
    const cron = require('node-cron');
    
    const User = mongoose.model('User', userSchema);
   
      
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'harshit.raj2023@gmail.com',
        pass: 'jabm wxak qzvu ugux'
    }
});

let otps = new Map();

app.post('/register', async (req, res) => {
    const { name, email, password, confirmPassword, dateOfBirth, gender, mobileNumber, city } = req.body;
            if (password !== confirmPassword) return res.status(400).send('Passwords do not match');

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password:hashedPassword, dateOfBirth, gender, mobileNumber, city });

    try {
        await newUser.save();
        const otp = crypto.randomInt(100000, 999999).toString();
        otps.set(email, await bcrypt.hash(otp, 10));
        setTimeout(() => otps.delete(email), 300000); // OTP expires in 5 minutes

        const mailOptions = {
            from: 'harshit.raj2023@gmail.com',
            to: email,
            subject: 'Email Verification',
            text: `Your OTP is: ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return res.status(500).send('Error sending email');
            res.status(200).send('Registered successfully, check your email for the OTP');
        });
    } catch (error) {
        res.status(500).send('Error registering user');
    }
});




app.post('/generate-otp', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Email not registered');

    const otp = crypto.randomInt(100000, 999999).toString();
    otps.set(email, await bcrypt.hash(otp, 10));
    setTimeout(() => otps.delete(email), 300000); // OTP expires in 5 minutes

    const mailOptions = {
        from: 'harshit.raj2023@gmail.com',
        to: email,
        subject: 'OTP Resent',
        text: `Your OTP is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return res.status(500).send('Error sending email');
        res.status(200).send('OTP resent to email');
    });
});

app.post('/verify', async (req, res) => {
    const { email, otp } = req.body;
    const hashedOtp = otps.get(email);
    if (!hashedOtp) return res.status(400).send('OTP expired or invalid');

    const isMatch = await bcrypt.compare(otp, hashedOtp);
    if (!isMatch) return res.status(400).send('Invalid OTP');

    otps.delete(email);
    const user = await User.findOne({ email });
    user.isVerified=true;
    await user.save();
    res.status(200).send('Email verified successfully');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid email or password');

    const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '1h' });
    res.status(200).json({ token });
});

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Email not registered');

    const otp = crypto.randomInt(100000, 999999).toString();
    otps.set(email, await bcrypt.hash(otp, 10));
    setTimeout(() => otps.delete(email), 300000); // OTP expires in 5 minutes

    const mailOptions = {
        from: 'harshit.raj2023@gmail.com',
        to: email,
        subject: 'Password Reset OTP',
        text: `Your OTP is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return res.status(500).send('Error sending email');
        res.status(200).send('OTP sent to email');
    });
});

app.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const hashedOtp = otps.get(email);
    if (!hashedOtp) return res.status(400).send('OTP expired or invalid');

    const isMatch = await bcrypt.compare(otp, hashedOtp);
    if (!isMatch) return res.status(400).send('Invalid OTP');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });
    otps.delete(email);
    res.status(200).send('Password reset successfully');
});

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date, required: true },
    priority: { type: Number, required: true }, // 1: Low, 2: Medium, 3: High
    category: { type: String },
    labels: [{ type: String }],
    status: { type: String, default: 'in-progress' }, // pending, in-progress, done
    userEmail: { type: String, required: true }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);


app.post('/tasks', async (req, res) => {
    const { title, description, dueDate, priority, category, labels, userEmail } = req.body;

    try {
        const newTask = new Task({
            title,
            description,
            dueDate,
            priority,
            category,
            labels,
            userEmail
        });

        await newTask.save();
        res.status(200).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error.message);
        res.status(500).send('Error creating task');
    }
});

app.get('/tasks', async (req, res) => {
    const userEmail = req.query.userEmail; // Fetch userEmail from query parameter

    try {
        const currentDate = new Date();
        const tomorrowDate = new Date();
        tomorrowDate.setDate(currentDate.getDate() + 1);
        updateOverdueTasks();
        const tasks = await Task.find({
            userEmail,
            status: 'in-progress',

        }).sort({ priority: -1 }); // Sort by priority descending

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
        res.status(500).send('Error fetching tasks');
    }
});
app.get('/alltasks', async (req, res) => {
    const { userEmail } = req.query;
    const tasks = await Task.find({ userEmail });
    res.json(tasks);
  });
// Update Task Endpoint
app.put('/tasks', async (req, res) => {
    const { title, userEmail, newTitle, newDescription} = req.body;

    try {
        const task = await Task.findOne({ title, userEmail });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update other fields
        task.title = newTitle;
        task.description = newDescription;

        await task.save();
        res.status(200).json(task);
    } catch (error) {
        console.error('Error updating task:', error.message);
        res.status(500).send('Error updating task');
    }
});

// Delete Task Endpoint
app.delete('/tasks', async (req, res) => {
    const { title, userEmail } = req.body;

    try {
        const deletedTask = await Task.findOneAndDelete({ title, userEmail });

        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error.message);
        res.status(500).json({ error: 'Error deleting task' });
    }
});
cron.schedule('0 11 * * *', async () => {
    console.log("time to shine")
    const currentDate = new Date();
    const tomorrowDate = new Date();
    tomorrowDate.setDate(currentDate.getDate() + 1);
  
    try {
      // Ensure only the date part is compared
      const startOfToday = new Date(currentDate.setHours(0, 0, 0, 0));
      const endOfToday = new Date(currentDate.setHours(23, 59, 59, 999));
      const startOfTomorrow = new Date(tomorrowDate.setHours(0, 0, 0, 0));
      const endOfTomorrow = new Date(tomorrowDate.setHours(23, 59, 59, 999));
  
      const tasksDueToday = await Task.find({ 
        dueDate: { $gte: startOfToday, $lt: endOfToday }, 
        status: 'in-progress' 
      });
      
      const tasksDueTomorrow = await Task.find({ 
        dueDate: { $gte: startOfTomorrow, $lt: endOfTomorrow }, 
        status: 'in-progress' 
      });
  
      for (const task of tasksDueToday) {
        const message = `Reminder: Your task "${task.title}" is due today.`;
        await Notification.create({ userEmail: task.userEmail, message });
        const mailOptions = {
          from: 'harshit.raj2023@gmail.com',
          to: task.userEmail,
          subject: 'Task Reminder',
          text: `Your task "${task.title}" is due today.please complete it before time so that you become punctual in life`
        };
  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending reminder email:', error.message);
          } else {
            console.log('Reminder email sent:', info.response);
          }
        });
      }
  
      for (const task of tasksDueTomorrow) {
        const message = `Reminder: Your task "${task.title}" is due tomorrow.`;
        await Notification.create({ userEmail: task.userEmail, message });
        const mailOptions = {
          from: 'harshit.raj2023@gmail.com',
          to: task.userEmail,
          subject: 'Task Reminder',
          text: `Your task "${task.title}" is due tomorrow.please complete it before time so that you become punctual in life`
        };
  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending reminder email:', error.message);
          } else {
            console.log('Reminder email sent:', info.response);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching tasks:', error.message);
    }
  });
  const notificationSchema = new mongoose.Schema({
    message: String,
    userEmail: String,
    timestamp: { type: Date, default: Date.now },
  });
  
  const Notification = mongoose.model('Notification', notificationSchema);
  app.post('/notifications', async (req, res) => {
    try {
      const { message, userEmail } = req.body;
      const newNotification = new Notification({ message, userEmail });
      await newNotification.save();
      res.status(201).send(newNotification);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  // Endpoint to get all notifications for a user
  app.get('/notifications', async (req, res) => {
    try {
      const { userEmail } = req.query;
      const notifications = await Notification.find({ userEmail }).sort({ timestamp: -1 });
      res.status(200).send(notifications);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  app.delete('/notifications/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deletedNotification = await Notification.findByIdAndDelete(id);
      if (!deletedNotification) {
        return res.status(404).send('Notification not found');
      }
      res.status(200).send(deletedNotification);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
const updateOverdueTasks = async () => {
    const currentDate = new Date();
    try {
        await Task.updateMany(
            { dueDate: { $lt: currentDate }, status: 'in-progress' },
            { $set: { status: 'not done' } }
        );
        console.log('Updated overdue tasks status to "not done".');
    } catch (error) {
        console.error('Error updating overdue tasks:', error.message);
    }
};
cron.schedule('0 10 * * *', async () => { // Runs every day at 9 AM
    const currentDate = new Date();
    updateOverdueTasks ();
    try {
        const overdueTasks = await Task.find({ dueDate: { $lt: currentDate }, status: 'in-progress' });

        overdueTasks.forEach(async task => {
          const message = `Reminder: Your task "${task.title}" has exceeded your due date hence you are penalised.`;
      await Notification.create({ userEmail: task.userEmail, message });
            const mailOptions = {
                from: 'harshit.raj2023@gmail.com',
                to: task.userEmail,
                subject: 'Task Overdue Reminder',
                text: `Reminder: Your task "${task.title}" is overdue. Your credibility points will be deducted.`
                    + `\n\nTask Details:\nTitle: ${task.title}\nDescription: ${task.description}`
                    + `\nDue Date: ${task.dueDate}\nPriority: ${task.priority}\nCategory: ${task.category}`
                    + `\nLabels: ${task.labels.join(', ')}\nStatus: ${task.status}`
                    + `\n\nTo avoid such situations in the future, please make sure to manage your tasks efficiently.`
            };

            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    console.error('Error sending overdue task reminder email:', error.message);
                } else {
                    console.log('Overdue task reminder email sent:', info.response);
                }
            });
        });
    } catch (error) {
        console.error('Error fetching overdue tasks:', error.message);
    }
});
app.put('/mark-done', async (req, res) => {
    const { title, userEmail } = req.body;
  
    try {
      const task = await Task.findOneAndUpdate(
        { title, userEmail },
        { status: 'done' },
      );
  
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Failed to mark task as done' });
    }
  });
  
  app.get('/done-tasks', async (req, res) => {
    const { userEmail } = req.query;
  
    try {
      const tasks = await Task.find({ userEmail, status: 'done' });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch done tasks' });
    }
  });
  // Fetch user data
app.get('/user', async (req, res) => {
    const { email } = req.query;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).send('User not found');
      res.status(200).json(user);
    } catch (error) {
      res.status(500).send('Error fetching user data');
    }
  });
  
  // Update user data
  app.put('/update-user', async (req, res) => {
    const { email, name, mobileNumber, city, newPassword } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).send('User not found');
  
      user.name = name;
      user.mobileNumber = mobileNumber;
      user.city = city;
  
      if (newPassword) {
        user.password = await bcrypt.hash(newPassword, 10);
      }
  
      await user.save();
      res.status(200).send('User data updated successfully');
    } catch (error) {
      res.status(500).send('Error updating user data');
    }
  });
  

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});