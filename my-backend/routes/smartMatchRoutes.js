import express from "express";
import { smartMatchDoctors } from "../controllers/smartMatchController.js";

const router = express.Router();

router.get("/", smartMatchDoctors);

export default router;
