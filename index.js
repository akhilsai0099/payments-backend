const express = require("express");
const cors = require("cors");
const rootRouter = require("./routes");
require("dotenv").config();

const app = new express();
app.use(cors());
app.use(express.json());

app.use("/api/v1", rootRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
