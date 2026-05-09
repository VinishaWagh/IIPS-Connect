const express = require("express");
const router = express.Router();

const {getProfile, getSuggestions, updateProfile, updatePassword, getMentors, getConnectionsCount, getUserById, getUserPosts, updateProfileFull} = require("../controllers/userController");
const authentication = require("../middleware/authMiddleware");

router.get("/profile", authentication, getProfile);
router.get("/suggestions", authentication, getSuggestions);
router.put("/profile", authentication, updateProfile);
router.put("/password", authentication, updatePassword);
router.get("/mentors", authentication, getMentors);
router.get("/connections-count", authentication, getConnectionsCount);
router.get("/:id",        authentication, getUserById);
router.get("/:id/posts",  authentication, getUserPosts);
router.put("/update/full", authentication, updateProfileFull);
module.exports = router;