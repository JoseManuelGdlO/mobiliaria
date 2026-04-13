import express from "express";
import { verifyToken } from "../libs/headers";

const router = express.Router();
const recommendationsService = require("../services/recommendations");

router.post("/moodboard", verifyToken, async function (req: any, res: any, next: any) {
  try {
    const bearer: any = req.authPayload;
    const idEmpresa = Number(bearer?.data?.id_empresa);
    const response = await recommendationsService.getMoodboard(idEmpresa, req.body ?? {});
    res.status(response.code).json(response.data);
  } catch (err: any) {
    console.error("Error while building moodboard recommendations", err.message);
    next(err);
  }
});

module.exports = router;
