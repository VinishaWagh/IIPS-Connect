const express = require("express");
const router = express.Router();

const authentication = require("../middleware/authMiddleware");

const {
  globalSearch
} = require("../controllers/searchController");

router.get("/", authentication, globalSearch);

module.exports = router;