import { config } from "dotenv";
config();
import nodemailer from "nodemailer";

const Mailer = async (toEmail, subject, text) => {
  // Set up the transporter
  let transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: "stocksage2024@gmail.com",
      pass: process.env.APP_PASSWORD,
    },
  });

  let mailOptions = {
    from: "stocksage2024@gmail.com",
    to: toEmail,
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Email sent: " + info.response);
  });
};

export default Mailer;