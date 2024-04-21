// backend/routes/user.js
const express = require("express");
const {
  signupSchema,
  signinSchema,
  userDataUpdate,
} = require("../Types/types");
const { User, Account } = require("../db/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Authmiddleware } = require("../middlewares/middleware");

const router = express.Router();
require("dotenv").config();

router.post("/signup", async (req, res) => {
  const { username, firstName, lastName, password } = req.body;
  const isValid = signupSchema.safeParse({
    username,
    firstName,
    lastName,
    password,
  });

  if (!isValid.success) {
    return res.status(400).json({
      msg: "Invalid data provided to the server!",
      error: isValid.error,
    });
  }

  try {
    const userExists = await User.exists({ username });
    if (userExists) {
      return res
        .status(411)
        .json({ msg: "Email already taken / Incorrect inputs" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username: username,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
    });
    const userID = newUser._id;
    await Account.create({
      userId: userID,
      balance: 1 + Math.random() * 10000,
    });

    const token = jwt.sign({ id: userID, username }, process.env.JWT_SECRET);
    res.status(200).json({ UserID: userID, token: token });
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
});

router.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  const isValid = signinSchema.safeParse({
    username,
    password,
  });

  if (!isValid.success) {
    return res.status(400).json({
      msg: "Invalid data provided to the server!",
      error: isValid.error,
    });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(411).json({ msg: "Invalid Username Or password" });
    }
    const validpass = await bcrypt.compare(password, user.password);
    if (!validpass) {
      return res.status(411).json({ msg: "Invalid Username Or password" });
    }
    const token = jwt.sign(
      { id: user._id, firstName: user.firstName },
      process.env.JWT_SECRET
    );
    res.status(200).json({ token: token, firstName: user.firstName });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: error });
  }
});

router.post("/", Authmiddleware, async (req, res) => {
  const { success } = userDataUpdate.safeParse(req.body);
  if (!success) {
    return res
      .status(411)
      .json({ msg: "Invalid data provided to the server!" });
  }
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await User.updateOne(
      { _id: req.userId },
      { ...req.body, password: hashedPassword }
    );
    return res.status(200).json({ msg: "User data updated successfully!" });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.post("/bulk", Authmiddleware, async (req, res) => {
  const filter = req.query.filter || "";

  try {
    const users = await User.find({
      $or: [
        { firstName: { $regex: filter } },
        { lastName: { $regex: filter } },
      ],
      _id: { $ne: req.userId },
    });

    return res.status(200).json({
      msg: "Fetched",
      users: users.map((user) => ({
        firstName: user.firstName,
        lastName: user.lastName,
        id: user._id,
      })),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});
module.exports = router;
