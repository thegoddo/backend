import bcrypt from "bcryptjs";
import User from "../models/User";
import generateUniqueConnectCode from "../utils/generateUniqueConnectCode";

class AuthController {
  static async register(req, res) {
    try {
      const { fullName, username, email, password } = req.body;

      if (!fullName || !username || !email || !password) {
        res.status(400).json({ message: "All fields are required" });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters long" });
      }

      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User already exists with username or email" });
      }

      // salt password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        username,
        fullName,
        email,
        password,
        connectCode: await generateUniqueConnectCode(),
      });
      await user.save();

      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Registration Error: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default AuthController;
