import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export const sendOTP = async (userEmail, otpCode) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: userEmail,
    subject: "Your BaatCheet Login OTP",
    html: `<h3>Your Verification Code is: <b>${otpCode}</b></h3><p>This code expires in 5 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
