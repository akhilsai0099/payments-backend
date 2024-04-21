const express = require("express");
const userRouter = require("./user");
const accountRouter = require("./accounts");
require("dotenv").config();

const Router = express.Router();

Router.use("/user", userRouter);
Router.use("/accounts", accountRouter);

Router.get("/", (req, res) => {
  res.status(200).json({ Msg: "Hello World!" });
});

module.exports = Router;
