const express = require("express");
const router = express.Router();
const {
  sendRequest, getMyRequests, respondRequest,
  getMySentRequests, getRequestStatus
} = require("../controllers/mentorshipController");
const authentication = require("../middleware/authMiddleware");

router.post("/request/:alumniId",       authentication, sendRequest);
router.get("/my-requests",              authentication, getMyRequests);
router.put("/respond/:requestId",       authentication, respondRequest);
router.get("/sent",                     authentication, getMySentRequests);
router.get("/status/:alumniId",         authentication, getRequestStatus);
module.exports = router;