const express = require("express");
const router = express.Router();
const { getNotifications, markAllRead, markAsRead } = require("../controllers/notificationController");
const authentication = require("../middleware/authMiddleware");

router.get("/", authentication, getNotifications);
router.put("/read-all", authentication, markAllRead);
router.put("/:id/read", authentication, markAsRead);
module.exports = router;