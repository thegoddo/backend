import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, resizeBy, next) => {
  try {
    const token = req.cookie.jwt;

    if (!token) {
      return res.status(401).json({ message: "Not Authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.userid).select("-password");
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Not authorized" });
  }
};

export default authMiddleware;
