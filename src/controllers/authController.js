const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const bcrypt = require("bcrypt");


// When "POST /api/auth/signup" is called
//Why async (because database and hashing takes time)
exports.signup = async (req, res)=>{
    try{
        //destructuring
        const { name, email, password, role} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);  //salt rounds - more rounds = more secure but slower
        const normalizedRole = role.toLowerCase();

        const newUser = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, hashedPassword, normalizedRole]
        );
        delete newUser.rows[0].password;  //more secured
        res.status(201).json(newUser.rows[0]);

    } catch(error){
        res.status(500).json({error: error.message});
    }
};


exports.login = async (req, res)=>{
    try{
        // checking for user
        const {email, password} = req.body;
        const user = await pool.query(
            "SELECT * FROM users WHERE email = $1", [email]
        );

        if(user.rows.length === 0){
            return res.status(400).json({message: "User not found"});
        }

        //checking for valid Password
        const validPassword = await bcrypt.compare(
            password,
            user.rows[0].password
        );

        if(!validPassword){
            return res.status(400).json({message: "Invalid password"});
        }

        const token = jwt.sign(
            {id: user.rows[0].id, role: user.rows[0].role},
            process.env.JWT_SECRET,
            {expiresIn: "1d"}
        );

        res.json({token});
    } catch(error) {
        res.status(500).json({error: error.message});
    }
};