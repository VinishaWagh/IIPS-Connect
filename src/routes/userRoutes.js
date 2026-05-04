const express = require("express");
const router = express.Router();

const {getProfile, getSuggestions, updateProfile, updatePassword, getMentors} = require("../controllers/userController");
const authentication = require("../middleware/authMiddleware");

router.get("/profile", authentication, getProfile);
router.get("/suggestions", authentication, getSuggestions);
router.put("/profile", authentication, updateProfile);
router.put("/password", authentication, updatePassword);
router.get("/mentors", authentication, getMentors);
module.exports = router;