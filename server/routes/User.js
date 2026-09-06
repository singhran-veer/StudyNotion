// Import the required modules
const express = require("express")
const router = express.Router()

// Import the required controllers and middleware functions
const {
  login,
  signUp,
  sendOTP,
  changePassword,
} = require("../controllers/Auth")
const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword")

const { auth } = require("../middlewares/auth")
const { createRateLimiter, emailAndIp } = require("../middlewares/rateLimiter")

const loginLimiter = createRateLimiter({
  keyPrefix: "login",
  maxRequests: 10,
  windowSeconds: 15 * 60,
  keyGenerator: emailAndIp,
})
const otpLimiter = createRateLimiter({
  keyPrefix: "send-otp",
  maxRequests: 3,
  windowSeconds: 10 * 60,
  keyGenerator: emailAndIp,
})
const resetTokenLimiter = createRateLimiter({
  keyPrefix: "reset-token",
  maxRequests: 3,
  windowSeconds: 10 * 60,
  keyGenerator: emailAndIp,
})
const resetPasswordLimiter = createRateLimiter({
  keyPrefix: "reset-password",
  maxRequests: 10,
  windowSeconds: 10 * 60,
})

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for user login
router.post("/login", loginLimiter, login)

// Route for user signup
router.post("/signup", signUp)

// Route for sending OTP to the user's email
router.post("/sendotp", otpLimiter, sendOTP)

// Route for Changing the password
router.post("/changepassword", auth, changePassword)

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token
router.post("/reset-password-token", resetTokenLimiter, resetPasswordToken)

// Route for resetting user's password after verification
router.post("/reset-password", resetPasswordLimiter, resetPassword)

// Export the router for use in the main application
module.exports = router
