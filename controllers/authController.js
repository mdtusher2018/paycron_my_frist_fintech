const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/user_model");
const Authentication = require("../models/authentication_model");
const Balance = require("../models/balance_model");
const Transaction = require("../models/transaction_model");
const mongoose = require('mongoose');
const  balanceController  = require('../controllers/balanceController');
const  transactionController  = require('../controllers/transactionController');


const {
  JWT_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} = require("../config/secret");


// ---------------------- SIGNUP ------------------------
exports.signup = async (req, res) => {
  console.log(req.body);
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

    // await sendEmail(
    //   email,
    //   "Email Verification OTP",
    //   `<p>Your OTP is <b>${otp}</b></p>`
    // );

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
exports.verifyEmailWithOTP = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const authHeader = req.headers.authorization;
    const { otp } = req.body;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Token missing or malformed.");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.otp !== otp) {
      throw new Error("Invalid OTP.");
    }

    // ✅ MUST use session
    const userExists = await User.findOne({
      email: decoded.email,
    }).session(session);

    if (userExists) {
      throw new Error("User already verified.");
    }

    // 1️⃣ Create new user (with session)
    const newUser = new User({
      email: decoded.email,
      pin: decoded.pin,
      role: decoded.role,
    });

    await newUser.save({ session });

    // 2️⃣ Create Authentication
    const authRecord = new Authentication({
      user: newUser._id,
      email_verified: true,
      identity_verified: false,
      account_status: "Verified",
    });

    await authRecord.save({ session });

    // 3️⃣ Create initial balance
    await balanceController.addBalanceWithSession(
      newUser._id,
      5000,
      session,
      "BDT"
    );

    // 4️⃣ Create transaction
    await transactionController.createTransaction(
      newUser._id,
      newUser._id,
      "Deposit",
      5000,
      "Completed",
      "Initial Bonus",
      session
    );

    // ✅ Commit AFTER everything succeeds
    await session.commitTransaction();
    session.endSession();

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
      status: true,
      message: "Email verified and account created successfully.",
      accessToken,
      refreshToken,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};


// ---------------------- SIGNIN ------------------------
exports.signin = async (req, res) => {
  console.log(req.body);
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

const verificationStatus= await Authentication.findOne({user:user._id});

    if (!verificationStatus.email_verified) {
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

