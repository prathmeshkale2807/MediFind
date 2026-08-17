import express from "express";

import {
    getBeds,
    addBed,
    updateBed,
    deleteBed
} from "../controllers/bedController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";


const router = express.Router();


// =====================================================
// LOGGED-IN USERS
// =====================================================

// Get all bed availability
router.get(
    "/",
    authenticateToken,
    getBeds
);


// =====================================================
// ADMIN ONLY
// =====================================================

// Add bed
router.post(
    "/",
    authenticateToken,
    adminOnly,
    addBed
);


// Update bed
router.put(
    "/:id",
    authenticateToken,
    adminOnly,
    updateBed
);


// Delete bed
router.delete(
    "/:id",
    authenticateToken,
    adminOnly,
    deleteBed
);


export default router;