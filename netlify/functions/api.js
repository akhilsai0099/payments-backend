// YOUR_BASE_DIRECTORY/netlify/functions/api.ts
const cors = require("cors");
import express, { Router } from "express";
import serverless from "serverless-http";
const rootRouter = require("../../routes");
require("dotenv").config();
const api = express();
api.use(cors());
api.use(express.json());

const router = Router();
router.get("/hello", (req, res) => res.send("Hello World!"));

api.use("/api/v1", rootRouter);

export const handler = serverless(api);
