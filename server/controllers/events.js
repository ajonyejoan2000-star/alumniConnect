const Event = require("../models/events");
const Notification = require("../models/notification");

//CREATE EVENTS
const createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user.id
    });

    await event.populate('createdBy', 'name profilePicture');

    res.status(201).json({ message: 'Event created', data: event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//GET ALL EVENTS
const getEvents = async (req, res) => {
  try {
    const { type, location, page = 1, limit = 20, search } = req.query;

    let filter = {};
    if (type) filter.eventType = type;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const events = await Event.find(filter)
      .populate('createdBy', 'name profilePicture')
      .sort({ date: 1 })
      .limit(limit)
      .skip(skip);

    const total = await Event.countDocuments(filter);

    res.status(200).json({
      message: 'Events fetched',
      events,
      pagination: { total, pages: Math.ceil(total / limit), currentPage: page }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE EVENT
const getEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate('createdBy', 'name profilePicture email')
      .populate('rsvps.user', 'name profilePicture')
      .populate('attendees', 'name profilePicture');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: 'Event fetched', data: event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RSVP TO EVENT
const rsvpEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body; // 'going', 'interested', 'not_going'
    const userId = req.user.id;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already RSVPed
    const existingRSVP = event.rsvps.find(r => r.user.toString() === userId);

    if (existingRSVP) {
      existingRSVP.status = status;
    } else {
      event.rsvps.push({ user: userId, status });
    }

    // Add to attendees if status is 'going'
    if (status === 'going' && !event.attendees.includes(userId)) {
      event.attendees.push(userId);
    } else if (status !== 'going') {
      event.attendees = event.attendees.filter(id => id.toString() !== userId);
    }

    await event.save();

    // Create notification for event organizer
    const notification = new Notification({
      user: event.createdBy,
      type: 'event_invitation',
      title: `New RSVP for ${event.title}`,
      message: `Someone RSVPed to your event`,
      relatedId: eventId
    });
    await notification.save();

    res.status(200).json({ message: 'RSVP updated', data: event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET EVENT ATTENDEES
const getEventAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate('attendees', 'name profilePicture email role');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({
      message: 'Event attendees fetched',
      attendees: event.attendees,
      count: event.attendees.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEvent,
  rsvpEvent,
  getEventAttendees
};