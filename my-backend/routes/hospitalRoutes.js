import express from "express";

import {
    getHospitals,
    getHospitalById,
    getNearbyHospitals,
    getGoogleHospitalPhoto,
    addHospital,
    updateHospital,
    deleteHospital
} from "../controllers/hospitalController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";


const router = express.Router();


// =====================================================
// PUBLIC HOSPITAL ROUTES
// =====================================================

// Get all hospitals
router.get(
    "/",
    getHospitals
);


// Find hospitals near user's location
// Example:
// /hospitals/nearby?lat=18.5204&lng=73.8567
router.get(
    "/nearby",
    getNearbyHospitals
)


router.get(
    "/google-photo",
    getGoogleHospitalPhoto
)

router.get(
    "/:id",
    getHospitalById
)


// =====================================================
// ADMIN HOSPITAL ROUTES
// =====================================================


// Add hospital
router.post(
    "/",
    authenticateToken,
    adminOnly,
    addHospital
);


// Update hospital
router.put(
    "/:id",
    authenticateToken,
    adminOnly,
    updateHospital
);


// Delete hospital
router.delete(
    "/:id",
    authenticateToken,
    adminOnly,
    deleteHospital
);


// =====================================================
// EXPORT
// =====================================================

export default router;