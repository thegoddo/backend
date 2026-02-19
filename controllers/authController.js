import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import generateUniqueConnectCode from "../utils/generateUniqueConnectCode.js";
import generateOTP from "../utils/otpGenerator.js";
import RedisService from "../services/RedisService.js";
import { sendOTP } from "../services/EmailService.js";

class AuthController {
  static async register(req, res) {
    const regex = new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).+$",
    );
    try {
      const { fullName, username, email, password } = req.body;

      if (!fullName || !username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (password.length < 8) {
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters long" });
      } else if (password.length > 15) {
        return res.status(400).json({ message: "Password is too lengthy!!!" });
      }

      if (!regex.test(password)) {
        return res
          .status(400)
          .json({ message: "Password does not meet our criteria." });
      }

      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User already exists with username or email" });
      }

      const isEmailVerified =
        await RedisService.checkAndConsumeEmailVerification(email);
      if (!isEmailVerified) {
        return res
          .status(400)
          .json({ message: "Email not verified. Please verify OTP first." });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        username,
        fullName,
        email,
        password: hashedPassword,
        connectCode: await generateUniqueConnectCode(),
        isVerified: true,
      });

      await user.save();

      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Registration error", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async setOtp(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const otp = generateOTP();
      await RedisService.setOtp(email, otp);
      await sendOTP(email, otp);

      res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("Error sending OTP", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  }

  static async verifyUser(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
      }

      const isVerified = await RedisService.verifyOtp(email, otp);

      if (isVerified) {
        await RedisService.markEmailVerified(email);
        res.status(200).json({ message: "OTP Verified", success: true });
      } else {
        res
          .status(400)
          .json({ message: "Invalid or expired OTP", success: false });
      }
    } catch (error) {
      console.error("Error verifying OTP", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
      });

      res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          connectCode: user.connectCode,
        },
      });
    } catch (error) {
      console.error("Login error", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async me(req, res) {
    try {
      const user = await User.findById(req.user.id).select("-password");

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          connectCode: user.connectCode,
        },
      });
    } catch (error) {
      console.error("Me error", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async logout(req, res) {
    res.cookie("jwt", "", { maxAge: 0 });
    res.json({ message: "Logged out successfully!" });
  }
}

export default AuthController;
