const express = require("express");
const router = express.Router();

const auth = require("../middleware/protect");
const adminOnly = require("../middleware/authMiddleware");

const { createEvent, getEvents, getEvent, rsvpEvent, getEventAttendees } = require("../controllers/events");

router.get("/", getEvents);
router.get("/:id", getEvent);
router.post("/create", auth, adminOnly, createEvent);
router.post("/:eventId/rsvp", auth, rsvpEvent);
router.get("/:eventId/attendees", getEventAttendees);

module.exports = router;