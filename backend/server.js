const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sendEmailRoute = require("./routes/sendEmail");

dotenv.config();
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api", sendEmailRoute);
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
console.log("Sending email from:", process.env.EMAIL_USER);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
