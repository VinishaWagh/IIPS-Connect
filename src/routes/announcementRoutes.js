const express = require("express");
const router = express.Router();
const { getLatest, createAnnouncement, deleteAnnouncement, getAllAnnouncements, getAnnouncementById } = require("../controllers/announcementController");
const authentication = require("../middleware/authMiddleware");
const isFaculty = require("../middleware/isFaculty");

router.get("/latest", authentication, getLatest);
router.get("/", authentication, isFaculty, getAllAnnouncements);
router.post("/", authentication, isFaculty, createAnnouncement);
router.delete("/:id", authentication, isFaculty, deleteAnnouncement);
router.get("/:id", authentication, getAnnouncementById);
module.exports = router;