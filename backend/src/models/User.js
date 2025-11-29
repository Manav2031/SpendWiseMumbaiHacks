const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, unique: true },

    // Password is required only for normal email/password signups
    password: { type: String },

    // Google Authentication Fields
    googleId: { type: String, default: null },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    preferences: {
      currency: { type: String, default: "INR" },
    },

    // Normal signup users follow OTP verification
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
