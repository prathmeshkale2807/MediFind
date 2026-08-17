import express from "express";


// =========================================================
// ADMIN CONTROLLER
// =========================================================

import {
    getAdminDashboard,
    getUsers,
    getHospitals,
    getBeds,
    getAppointments,
    updateAppointmentStatus
} from "../controllers/adminController.js";


// =========================================================
// HOSPITAL CONTROLLER
// =========================================================

import {
    addHospital,
    updateHospital,
    deleteHospital
} from "../controllers/hospitalController.js";


// =========================================================
// DOCTOR CONTROLLER
// =========================================================

import {
    getDoctors,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    resendDoctorVerificationOTP,
    resendDoctorInvitation,
    verifyDoctorEmail
} from "../controllers/doctorController.js";

// =========================================================
// BED CONTROLLER
// =========================================================

import {
    addBed,
    updateBed,
    deleteBed
} from "../controllers/bedController.js";


// =========================================================
// MIDDLEWARE
// =========================================================

import {
    authenticateToken
} from "../middleware/authMiddleware.js";

import {
    adminOnly
} from "../middleware/adminMiddleware.js";


const router = express.Router();

router.get("/test-verification-route", (req, res) => {
    res.json({
        message: "Doctor verification routes are working"
    });
});


// =========================================================
// DOCTOR EMAIL VERIFICATION
// =========================================================
// These two routes must stay BEFORE adminOnly
// because the doctor needs to verify their email
// without being logged into the admin panel.
// =========================================================

router.post(
    "/doctors/verify-email",
    verifyDoctorEmail
);

router.post(
    "/doctors/resend-verification",
    resendDoctorVerificationOTP
);


// =========================================================
// ADMIN SECURITY
// =========================================================

router.use(
    authenticateToken,
    adminOnly
);


// =========================================================
// DASHBOARD
// =========================================================

router.get(
    "/dashboard",
    getAdminDashboard
);


// =========================================================
// USERS
// =========================================================

router.get(
    "/users",
    getUsers
);


// =========================================================
// DOCTORS
// =========================================================

router.get(
    "/doctors",
    getDoctors
);

router.post(
    "/doctors",
    addDoctor
);

router.put(
    "/doctors/:id",
    updateDoctor
);

router.delete(
    "/doctors/:id",
    deleteDoctor
);


// =========================================================
// HOSPITALS
// =========================================================

router.get(
    "/hospitals",
    getHospitals
);

router.post(
    "/hospitals",
    addHospital
);

router.put(
    "/hospitals/:id",
    updateHospital
);

router.delete(
    "/hospitals/:id",
    deleteHospital
);

router.post(
    "/doctors/resend-invitation",
    resendDoctorInvitation
);


// =========================================================
// BEDS
// =========================================================

router.get(
    "/beds",
    getBeds
);

router.post(
    "/beds",
    addBed
);

router.put(
    "/beds/:id",
    updateBed
);

router.delete(
    "/beds/:id",
    deleteBed
);


// =========================================================
// APPOINTMENTS
// =========================================================

router.get(
    "/appointments",
    getAppointments
);


// =========================================================
// UPDATE APPOINTMENT STATUS
// =========================================================

router.put(
    "/appointments/:id/status",
    updateAppointmentStatus
);


// =========================================================
// EXPORT
// =========================================================

export default router;