const express = require("express");
const router = express.Router();

const { signup, login, googleOAuth, googleCallback, forgotPassword, verifyResetToken, resetPassword } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-token", verifyResetToken);
router.post("/reset-password", resetPassword);
router.get("/google", googleOAuth);
router.get("/google/callback", googleCallback);

module.exports = router;