// The getMeetingRoomUrl() function is defined to fetch the meeting room URL from 
// the Whereby API using the new REST API. 
// The function is then called in the app.post('/meetings') route to 
// get the room URL before creating a new meeting in the database.

// It should work as long as you replace YOUR_API_KEY 

const express = require('express');
const mongoose = require('mongoose');
const fetch = require("cross-fetch");

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/meetingapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define meeting schema
const meetingSchema = new mongoose.Schema({
  title: String,
  startDate: Date,
  endDate: Date,
  host: String,
  participants: [String]
});

// Create meeting model
const Meeting = mongoose.model('Meeting', meetingSchema);

// API key for Whereby
const API_KEY = "YOUR_API_KEY";

// Function to fetch meeting room URL from Whereby API
async function getMeetingRoomUrl() {
  const data = {
    endDate: "2099-02-18T14:23:00.000Z",
    fields: ["hostRoomUrl"],
  };
  const response = await fetch("https://api.whereby.dev/v1/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  return json.hostRoomUrl;
}

// Route to create a new meeting
app.post('/meetings', async (req, res) => {
  try {
    // Get meeting room URL from Whereby API
    const roomUrl = await getMeetingRoomUrl();
    
    // Create new meeting
    const meeting = new Meeting({
      title: req.body.title,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      host: req.body.host,
      participants: req.body.participants,
      roomUrl: roomUrl
    });

    // Save meeting to database
    await meeting.save();

    // Return success response
    res.status(201).json({
      message: 'Meeting created successfully',
      data: meeting
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
});

// Route to get all meetings
app.get('/meetings', async (req, res) => {
  try {
    // Find all meetings in the database
    const meetings = await Meeting.find();

    // Return success response
    res.status(200).json({
      message: 'Meetings retrieved successfully',
      data: meetings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
});

// Start server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
