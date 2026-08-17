import express from "express";

import {
    getAppointments,
    getMyAppointments,
    getDoctorAppointments,
    bookAppointment,
    updateAppointment,
    cancelAppointment
} from "../controllers/appointmentController.js";

import {
    bookPublicAppointment
} from "../controllers/publicAppointmentController.js";

import {
    authenticateToken
} from "../middleware/authMiddleware.js";


const router = express.Router();


// =========================================================
// APPOINTMENT SECURITY
// =========================================================
//
// Every appointment operation now requires login.
// =========================================================


// =========================================================
// BOOK APPOINTMENT
// =========================================================

router.post(
    "/public",
    authenticateToken,
    bookPublicAppointment
);


// =========================================================
// DOCTOR APPOINTMENTS
// =========================================================

router.get(
    "/doctor",
    authenticateToken,
    getDoctorAppointments
);


// =========================================================
// MY APPOINTMENTS
// =========================================================

router.get(
    "/my",
    authenticateToken,
    getMyAppointments
);


// =========================================================
// ALL APPOINTMENTS
// =========================================================

router.get(
    "/",
    authenticateToken,
    getAppointments
);


// =========================================================
// BOOK APPOINTMENT
// =========================================================

router.post(
    "/",
    authenticateToken,
    bookAppointment
);


// =========================================================
// CANCEL APPOINTMENT
// =========================================================

router.put(
    "/:id/cancel",
    authenticateToken,
    cancelAppointment
);


// =========================================================
// UPDATE APPOINTMENT
// =========================================================

router.put(
    "/:id",
    authenticateToken,
    updateAppointment
);


export default router;