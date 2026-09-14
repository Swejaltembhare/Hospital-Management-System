import express from "express";
import {
  getAllDoctors,
  getAvailableSlots,
} from "../controllers/doctorController.js";

const router = express.Router();

// Public doctor directory lookup endpoint
router.get("/", getAllDoctors);

// Public doctor available time slot query endpoint
router.get("/available-slots/:doctorId", getAvailableSlots);

export default router;