

const User = require('../models/user_model');


exports.checkEmailExists = async (req, res) => {
console.log(req.body);
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Email not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Email exists",
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.completeProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, date_of_birth, address } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.complete_profile) {
      return res.status(400).json({
        success: false,
        message: "Profile has already been completed once and cannot be modified"
      });
    }

    if (first_name !== undefined) user.first_name = first_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (date_of_birth !== undefined) user.date_of_birth = date_of_birth;

    if (address) {
      user.address = { ...user.address.toObject(), ...address };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile completed successfully",
      data: user
    });

  } catch (error) {
    console.error("Complete Profile Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};





exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-pin -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};