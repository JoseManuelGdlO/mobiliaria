import express from "express";
import { verifyToken } from "../libs/headers";

const router = express.Router();
const quotesService = require("../services/quotes");

router.post("/live", verifyToken, async function (req: any, res: any, next: any) {
  try {
    const response = await quotesService.buildLiveQuote(req.body ?? {});
    res.status(response.code).json(response.data);
  } catch (err: any) {
    console.error("Error while building live quote", err.message);
    next(err);
  }
});

module.exports = router;
