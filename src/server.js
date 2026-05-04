// Imports
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Server Initialization
const app = express();

//Setting up middleware
app.use(cors());
app.use(express.json());


// First Route
app.get("/", (req, res)=>{
    res.send("IIPS Community API Running...");
});

const PORT = process.env.PORT || 5000;

// Officially turning server on
app.listen(PORT, ()=> {
    console.log(`Server Running on port ${PORT}`);
});


// Setting up Database Connection
const pool = require("./config/db.js");

pool.query("SELECT NOW()", (err, res)=>{
    if(err){
        console.error("Database connection error.", err);
    } else{
        console.log("Database Connected.", res.rows);
    }
});


//Authentication Route
const authRoute = require("./routes/authRoutes");
app.use("/api/auth", authRoute);

// Protected Route
const authenticateToken = require("./middleware/authMiddleware");

app.get("/api/protected", authenticateToken, (req, res)=> {
    res.json({
        message: "You accessed protected route!",
        user: req.user
    });
});

// User Profile
const userRoutes = require("./routes/userRoutes.js");
app.use("/api/users", userRoutes);

// Posts Operations
const postRoutes = require("./routes/postRoutes.js");
app.use("/api/posts", postRoutes); 


// Comments Operations
const commentRoutes = require("./routes/commentRoutes.js");
app.use("/api", commentRoutes);

// Like Operations
const likeRoutes = require("./routes/likeRoutes");
app.use("/api", likeRoutes);

// Event Operations
app.use("/api/events", require("./routes/eventRoutes"));

// Announcements
app.use("/api/announcements", require("./routes/announcementRoutes"));

// Notifications
app.use("/api/notifications", require("./routes/notificationRoutes"));

// Connections
app.use("/api/connections", require("./routes/connectionRoutes"));

//Attachments
app.use("/uploads", express.static("uploads"));

// Mentorship Operations
app.use("/api/mentorship", require("./routes/mentorshipRoutes"));
