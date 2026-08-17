import express from "express";

import {
    getDoctors,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    getMyProfile,
    getMyAppointments,
    updateMyAppointmentStatus,
    activateDoctorAccount
} from "../controllers/doctorController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { doctorOnly } from "../middleware/doctorMiddleware.js";
import { getDoctorSlots, getMyAvailability, saveMyAvailability } from "../controllers/scheduleController.js";

const router = express.Router();

// =====================================================
// PUBLIC DOCTOR ROUTES
// =====================================================

// Get all doctors (used by patient/frontend search)
router.get("/", getDoctors);

// Doctor account activation from invitation link.
// This must stay public because the doctor is not logged in yet.
router.post("/activate", activateDoctorAccount);

router.get("/:id/slots", getDoctorSlots);

// =====================================================
// LOGGED-IN DOCTOR ROUTES
// =====================================================

router.get(
    "/me",
    authenticateToken,
    doctorOnly,
    getMyProfile
);

router.get(
    "/my-availability",
    authenticateToken,
    doctorOnly,
    getMyAvailability
);

router.put(
    "/my-availability",
    authenticateToken,
    doctorOnly,
    saveMyAvailability
);

router.get(
    "/my-appointments",
    authenticateToken,
    doctorOnly,
    getMyAppointments
);

router.put(
    "/appointments/:id/status",
    authenticateToken,
    doctorOnly,
    updateMyAppointmentStatus
);

// =====================================================
// ADMIN DOCTOR MANAGEMENT
// =====================================================

router.post(
    "/",
    authenticateToken,
    adminOnly,
    addDoctor
);

router.put(
    "/:id",
    authenticateToken,
    adminOnly,
    updateDoctor
);

router.delete(
    "/:id",
    authenticateToken,
    adminOnly,
    deleteDoctor
);

export default router;
