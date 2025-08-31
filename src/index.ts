import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import * as nodemailer from "nodemailer";
import { PrismaClient } from "../src/generated/prisma/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.post("/register", async(req, res) => {
  const { email, name, phoneNumber, year, department, eventName, transactionId } = req.body;

  if (!email || !name || !phoneNumber || !year || !department || !eventName || !transactionId) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const existingRegistration = await prisma.user.findFirst({
      where: { email, eventName },
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: "User already registered for this event",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Event Registration" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Registration Confirmation for ${eventName}`,
      text: `Hello ${name},\n\nYou have successfully registered for ${eventName}.\nTransaction ID: ${transactionId}\n\nThank you!`,
    };

    await transporter.sendMail(mailOptions);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        phoneNumber,
        year,
        department,
        eventName,
        transactionId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful. Confirmation email sent.",
      data: newUser,
    });

  } catch (error: any) {
    console.error("Error in /register:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.get("/getAllUsers", async(req, res) => {
  let users;
  try {
    users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        eventName: true,
        transactionId: true,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }

  res.json({
    success: true,
    message: `Successfully fetched ${users.length} users`,
    data: users,
  });
});

app.listen(PORT, () => {
  console.log(`> Server is running on http://localhost:${PORT}`);
});
