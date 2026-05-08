const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../utils/emailService");


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

exports.googleOAuth = (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.SERVER_ROOT_URL || "http://localhost:5000"}/api/auth/google/callback`;

    if (!clientId) {
        return res.status(500).json({ error: "Google client ID is not configured." });
    }

    const oauthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    oauthUrl.searchParams.set("client_id", clientId);
    oauthUrl.searchParams.set("redirect_uri", redirectUri);
    oauthUrl.searchParams.set("response_type", "code");
    oauthUrl.searchParams.set("scope", "openid email profile");
    oauthUrl.searchParams.set("prompt", "select_account");

    res.redirect(oauthUrl.toString());
};

exports.googleCallback = async (req, res) => {
    try {
        const code = req.query.code;
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = `${process.env.SERVER_ROOT_URL || "http://localhost:5000"}/api/auth/google/callback`;

        if (!code || !clientId || !clientSecret) {
            return res.status(400).json({ error: "Invalid Google OAuth callback configuration." });
        }

        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });

        const tokenData = await tokenResponse.json();
        if (!tokenData.id_token) {
            return res.status(400).json({ error: "Unable to retrieve Google ID token." });
        }

        const verifyResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenData.id_token)}`);
        const googleUser = await verifyResponse.json();

        if (googleUser.aud !== clientId) {
            return res.status(400).json({ error: "Google token audience mismatch." });
        }

        const email = googleUser.email;
        const name = googleUser.name || "Google User";

        let user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const isNewGoogleUser = user.rows.length === 0;

        if (isNewGoogleUser) {
            const randomPassword = crypto.randomBytes(24).toString("hex");
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            const newUser = await pool.query(
                "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
                [name, email, hashedPassword, "student"]
            );
            user = newUser;
        }

        const token = jwt.sign(
            { id: user.rows[0].id, role: user.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const redirectUrl = isNewGoogleUser
            ? `${clientUrl}/role-selection?token=${encodeURIComponent(token)}`
            : `${clientUrl}/login?token=${encodeURIComponent(token)}`;
        res.redirect(redirectUrl);
    } catch (error) {
        console.error("Google callback error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(400).json({ message: "User not found" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Store token in database
        await pool.query(
            "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
            [user.rows[0].id, resetToken, expiresAt]
        );

        // Send email
        const emailSent = await sendPasswordResetEmail(email, resetToken);

        if (!emailSent) {
            return res.status(500).json({ message: "Failed to send reset email. Please try again later." });
        }

        res.json({ message: "Password reset link sent to your email" });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.verifyResetToken = async (req, res) => {
    try {
        const { token } = req.body;

        const result = await pool.query(
            "SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()",
            [token]
        );

        if (result.rows.length === 0) {
            return res.json({ valid: false });
        }

        res.json({ valid: true });
    } catch (error) {
        console.error("Verify reset token error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // Find valid token
        const tokenResult = await pool.query(
            "SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()",
            [token]
        );

        if (tokenResult.rows.length === 0) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        const userId = tokenResult.rows[0].user_id;

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password
        await pool.query(
            "UPDATE users SET password = $1 WHERE id = $2",
            [hashedPassword, userId]
        );

        // Delete used token
        await pool.query(
            "DELETE FROM password_reset_tokens WHERE token = $1",
            [token]
        );

        res.json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ error: error.message });
    }
};