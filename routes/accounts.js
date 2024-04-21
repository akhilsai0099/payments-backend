// backend/routes/accounts.js
const express = require("express");
const mongoose = require("mongoose");
const { User, Account } = require("../db/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Authmiddleware } = require("../middlewares/middleware");

const router = express.Router();

router.get("/balance", Authmiddleware, async (req, res) => {
  try {
    const useraccount = await Account.findOne({ userId: req.userId });
    res.status(200).json({ balance: useraccount.balance });
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/transfer", Authmiddleware, async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();
  const { amount, to } = req.body;

  const account = await Account.findOne({ userId: req.userId }).session(
    session
  );

  if (!account || account.balance < amount) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Insufficient balance",
    });
  }

  const toAccount = await Account.findOne({ userId: to }).session(session);

  if (!toAccount) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Invalid account",
    });
  }

  await Account.updateOne(
    { userId: req.userId },
    { $inc: { balance: -amount } }
  ).session(session);
  await Account.updateOne(
    { userId: to },
    { $inc: { balance: amount } }
  ).session(session);

  await session.commitTransaction();
  res.json({
    message: "Transfer successful",
  });
});

module.exports = router;
