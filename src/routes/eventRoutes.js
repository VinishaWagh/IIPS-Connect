const express = require("express");
const router = express.Router();
const { getUpcomingEvents, createEvent, deleteEvent, getEventById } = require("../controllers/eventController");
const authentication = require("../middleware/authMiddleware");
const isFaculty = require("../middleware/isFaculty");

router.get("/upcoming", authentication, getUpcomingEvents);
router.post("/", authentication, isFaculty, createEvent);
router.delete("/:id", authentication, isFaculty, deleteEvent);
router.get("/test", (req, res) => {
  res.json({ message: "Event routes working" });
});
router.get("/:id", authentication, getEventById);
module.exports = router;