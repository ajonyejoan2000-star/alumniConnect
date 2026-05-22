const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String, 
    required: true 
  },
  description: String,
  date: { 
    type: Date, 
    required: true 
  },
  endDate: Date,
  time: String,
  location: String,
  online: {
    type: Boolean,
    default: false
  },
  meetingLink: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  eventType: {
    type: String,
    enum: ['Networking', 'Workshop', 'Seminar', 'Social', 'Hackathon', 'Mentorship', 'Sisterhood Friday', 'Other'],
    default: 'Other'
  },
  maxCapacity: Number,
  rsvps: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: ['going', 'interested', 'not_going'],
      default: 'interested'
    },
    rsvpDate: {
      type: Date,
      default: Date.now
    }
  }],
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  agenda: [String],
  image: String,
  speakers: [{
    name: String,
    bio: String,
    image: String
  }],
  tags: [String],
  isVirtual: {
    type: Boolean,
    default: false
  },
  recordingLink: String,
  recap: String
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);