const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/user_model");
const {
  JWT_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} = require("../config/secret");
const challengeController = require("../controllers/challengeController");

// ---------------------- SIGNUP ------------------------
exports.signup = async (req, res) => {
  const { email, pin, role } = req.body;

  if (!email || !pin) {
    return res.status(400).json({
      statusCode: 400,
      status: false,
      message: "Email, and Pin are required.",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: "Email is already registered.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[OTP] Generated for ${email}: ${otp} (type: ${typeof otp})`);
    console.log(
      `[pin] Received from signup: ${pin} (type: ${typeof pin})`
    );

    const tokenPayload = { email, pin, otp, role };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "10m" });

    await sendEmail(
      email,
      "Email Verification OTP",
      `<p>Your OTP is <b>${otp}</b></p>`
    );

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: "OTP sent to your email. Please verify.",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Signup failed.",
      error: error.message,
    });
  }
};

// ---------------------- EMAIL VERIFICATION ------------------------
exports.verifyEmailWithOTP = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { otp } = req.body;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      statusCode: 401,
      status: false,
      message: "Token missing or malformed.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    console.log(`[OTP] Received from client: ${otp} (type: ${typeof otp})`);
    console.log(
      `[OTP] Decoded from token: ${decoded.otp} (type: ${typeof decoded.otp})`
    );
    console.log(
      `[pin] Before saving: ${
        decoded.pin
      } (type: ${typeof decoded.pin})`
    );

    if (decoded.otp !== otp) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: "Invalid OTP.",
      });
    }

    const userExists = await User.findOne({ email: decoded.email });
    if (userExists) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: "User already verified.",
      });
    }

    const newUser = new User({

      email: decoded.email,
      pin: decoded.pin, 
      role: decoded.role,

    });

    await newUser.save();
    console.log(
      `[pin] Saved to DB (should be hashed): ${newUser.pin}`
    );

    const accessToken = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Email verified and account created successfully.",
      accessToken,
      refreshToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      status: false,
      message: "Invalid or expired token.",
      error: error.message,
    });
  }
};

// ---------------------- SIGNIN ------------------------
exports.signin = async (req, res) => {
  const { email, pin } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: "Invalid email or pin",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        statusCode: 401,
        status: false,
        message: "Please verify your email",
      });
    }

    const isMatch = await user.comparepin(pin);
    if (!isMatch) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: "Invalid email or pin",
      });
    }

    // ✅ 1. Generate tokens
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        user,
      },
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Login failed",
      error: err.message,
    });
  }
};

