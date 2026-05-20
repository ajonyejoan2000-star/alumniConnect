const express = require("express");
const router = express.Router();

const auth = require("../middlewares/protect");
const adminOnly = require("../middlewares/authMiddleware");

const { createEvent, getEvents } = require("../controllers/events");

router.get("/event", getEvents);
router.post("/event", auth, adminOnly, createEvent);

module.exports = router;