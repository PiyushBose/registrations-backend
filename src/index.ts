import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "./generated/prisma/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

//TODO: Implement the register endpoint
app.post("/register", (req, res) => {
/*
- Check if there is already a registration with given email for the given event. If yes then return apt response.
- Verify email using nodemailer.
- Create registration. 
*/
});

app.get("/getAllUsers", (req, res) => {
  let users;
  try {
    users = prisma.user.findMany({
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
