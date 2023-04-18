const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./user.model');

const app = express();
const PORT = 3030;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/whereby', { useNewUrlParser: true });

// Set up middleware
app.use(bodyParser.json());

// Create a new user
app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = new User({ name, email });
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a list of all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a single user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new Error('User not found');
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a user by ID
app.put('/users/:id', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id,

    { name, email },
    { new: true }
  );
  if (!user) throw new Error('User not found');
  res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a user by ID
app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new Error('User not found');
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

