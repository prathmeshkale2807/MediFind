import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

import bedRoutes from "./routes/bedRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import {
    verifyDoctorEmail,
    resendDoctorVerificationOTP
} from "./controllers/doctorController.js";
import contactRoutes from "./routes/contactRoutes.js";
import smartMatchRoutes from "./routes/smartMatchRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";


// =========================================================
// LOAD ENVIRONMENT VARIABLES
// =========================================================

dotenv.config();


// =========================================================
// GOOGLE MAPS API CHECK
// =========================================================

console.log(
    "Google Maps API key loaded:",
    process.env.GOOGLE_MAPS_API_KEY
        ? "YES"
        : "NO"
);


// =========================================================
// CREATE EXPRESS APP
// =========================================================

const app = express();


// =========================================================
// CORS
// =========================================================

app.use(
    cors({
        origin: true,
        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);


// =========================================================
// JSON BODY PARSER
// =========================================================

app.use(express.json());


// =========================================================
// ROOT ROUTE
// =========================================================

app.get("/", (req, res) => {

    res.json({
        message:
            "🏥 Hospital Portal Backend Running 🚀"
    });

});


// =========================================================
// DATABASE TEST
// =========================================================

app.get("/test-db", async (req, res) => {

    try {

        const result =
            await pool.query("SELECT NOW()");

        res.json({
            message:
                "Connected to PostgreSQL successfully!",

            time:
                result.rows[0].now
        });

    } catch (err) {

        console.error(
            "Database error:",
            err
        );

        res.status(500).json({

            message:
                "Database connection failed!",

            error:
                err.message
        });

    }

});


// =========================================================
// DEBUG ROUTE
// =========================================================

app.get("/debug-verification", (req, res) => {

    res.json({
        message:
            "THIS SERVER.JS IS RUNNING"
    });

});


// =========================================================
// NORMAL APPLICATION ROUTES
// =========================================================

app.use(
    "/hospitals",
    hospitalRoutes
);

app.use(
    "/doctors",
    doctorRoutes
);

app.use(
    "/beds",
    bedRoutes
);

app.use(
    "/appointments",
    appointmentRoutes
);
app.use(
    "/notifications",
    notificationRoutes
);
app.use(
    "/contact",
    contactRoutes
);

app.use("/smart-match", smartMatchRoutes);
app.use("/features", reviewRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.use("/patient", patientRoutes);


// =========================================================
// ADMIN ROUTES
// =========================================================

app.use(
    "/admin",
    adminRoutes
);


// =========================================================
// DOCTOR EMAIL VERIFICATION
// =========================================================
//
// These routes are intentionally registered directly here.
// They do NOT require admin authentication because the
// doctor must be able to verify their own email.
//

app.post(
    "/admin/doctors/verify-email",
    verifyDoctorEmail
);

app.post(
    "/admin/doctors/resend-verification",
    resendDoctorVerificationOTP
);


// =========================================================
// AUTH ROUTES
// =========================================================

app.use(
    "/auth",
    authRoutes
);


// =========================================================
// 404 HANDLER
// =========================================================

app.use((req, res) => {

    res.status(404).json({

        message:
            "Route not found",

        path:
            req.originalUrl
    });

});


// =========================================================
// ADVANCED FEATURE TABLES
// =========================================================

async function ensureAdvancedFeatureTables() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS doctor_availability (
            availability_id SERIAL PRIMARY KEY,
            doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
            day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            slot_minutes INTEGER NOT NULL DEFAULT 60 CHECK (slot_minutes BETWEEN 15 AND 240),
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            UNIQUE (doctor_id, day_of_week, start_time, end_time)
        );
        CREATE TABLE IF NOT EXISTS doctor_reviews (
            review_id SERIAL PRIMARY KEY,
            doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
            patient_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
            appointment_id INTEGER UNIQUE REFERENCES appointments(appointment_id) ON DELETE SET NULL,
            rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
            review_text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (doctor_id, patient_id, appointment_id)
        );
        CREATE TABLE IF NOT EXISTS prescriptions (
            prescription_id SERIAL PRIMARY KEY,
            appointment_id INTEGER UNIQUE REFERENCES appointments(appointment_id) ON DELETE CASCADE,
            doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
            patient_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
            diagnosis TEXT, instructions TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS prescription_items (
            item_id SERIAL PRIMARY KEY,
            prescription_id INTEGER NOT NULL REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
            medicine_name VARCHAR(150) NOT NULL, dosage VARCHAR(100), frequency VARCHAR(100),
            duration VARCHAR(100), instructions TEXT
        );
    `);
}

// =========================================================
// SERVER
// =========================================================

const PORT = process.env.PORT || 3000;

ensureAdvancedFeatureTables()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Advanced feature database setup failed:', error);
        process.exit(1);
    });