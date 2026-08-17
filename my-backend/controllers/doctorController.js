import pool from "../db.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
// =========================================================
// DOCTOR PHOTOS
// =========================================================

const doctorPhotos = [
    "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1580281657702-257584239a55?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=600&auto=format&fit=crop"
];


// =========================================================
// EMAIL TRANSPORTER
// Same configuration as your authController
// =========================================================

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        type: "OAuth2",

        user: process.env.SMTP_USER,

        clientId:
            process.env.GOOGLE_CLIENT_ID,

        clientSecret:
            process.env.GOOGLE_CLIENT_SECRET,

        refreshToken:
            process.env.GOOGLE_REFRESH_TOKEN
    }
});


// =========================================================
// GENERATE OTP
// =========================================================

function generateOTP() {

    return crypto
        .randomInt(100000, 1000000)
        .toString();

}


// =========================================================
// HASH OTP
// =========================================================

function hashOTP(otp) {

    return crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

}


// =========================================================
// OTP EXPIRY
// 10 MINUTES
// =========================================================

function getOTPExpiry() {

    return new Date(
        Date.now() + 10 * 60 * 1000
    );

}


// =========================================================
// SEND DOCTOR VERIFICATION EMAIL
// =========================================================

async function sendDoctorVerificationEmail({
    email,
    fullName,
    otp
}) {

    await transporter.sendMail({

        from:
            process.env.SMTP_FROM ||
            process.env.SMTP_USER,

        to: email,

        subject:
            "MediFind - Verify Doctor Email",

        text:
            `Hello Dr. ${fullName},\n\n` +
            `Your MediFind doctor email verification OTP is:\n\n` +
            `${otp}\n\n` +
            `This OTP will expire in 10 minutes.\n\n` +
            `If you did not request this verification, please ignore this email.\n\n` +
            `MediFind`,

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 30px auto;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-radius: 16px;
                background: #ffffff;
            ">

                <h2 style="
                    color: #2563eb;
                    margin-bottom: 20px;
                ">
                    MediFind Doctor Verification
                </h2>

                <p>
                    Hello Dr. ${fullName},
                </p>

                <p>
                    An administrator has added your doctor
                    profile to MediFind.
                </p>

                <p>
                    Please verify that you have access to
                    this email address using the OTP below.
                </p>

                <div style="
                    margin: 25px 0;
                    padding: 20px;
                    background: #f1f5f9;
                    border-radius: 12px;
                    text-align: center;
                ">

                    <div style="
                        font-size: 13px;
                        color: #64748b;
                        margin-bottom: 8px;
                    ">
                        Verification OTP
                    </div>

                    <strong style="
                        font-size: 34px;
                        letter-spacing: 8px;
                        color: #2563eb;
                    ">
                        ${otp}
                    </strong>

                </div>

                <p>
                    This OTP will expire in
                    <strong>10 minutes</strong>.
                </p>

                <p style="
                    color: #64748b;
                    font-size: 14px;
                ">
                    If you did not request this verification,
                    please ignore this email.
                </p>

                <p>
                    Regards,<br>
                    <strong>MediFind</strong>
                </p>

            </div>
        `
    });

}

// =========================================================
// SEND DOCTOR INVITATION EMAIL
// =========================================================

async function sendDoctorInvitationEmail({
    email,
    fullName,
    activationLink
}) {

    await transporter.sendMail({

        from:
            process.env.SMTP_FROM ||
            process.env.SMTP_USER,

        to:
            email,

        subject:
            "MediFind - Doctor Account Invitation",

        text:
            `Hello Dr. ${fullName},\n\n` +

            `An administrator has added you as a doctor on MediFind.\n\n` +

            `Your doctor account has been created for you.\n\n` +

            `Please activate your account and create your password using the link below:\n\n` +

            `${activationLink}\n\n` +

            `This activation link is valid for 24 hours.\n\n` +

            `If the link expires, please contact the MediFind administrator and ask them to resend your invitation.\n\n` +

            `Regards,\n` +
            `MediFind`,

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 30px auto;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-radius: 16px;
                background: white;
            ">

                <h2 style="
                    color: #2563eb;
                    margin-bottom: 20px;
                ">
                    Welcome to MediFind
                </h2>

                <p>
                    Hello <strong>Dr. ${fullName}</strong>,
                </p>

                <p>
                    An administrator has added you as a
                    doctor on MediFind.
                </p>

                <p>
                    Your doctor account has already been
                    created. You only need to activate it
                    and create your password.
                </p>

                <div style="
                    margin: 30px 0;
                    text-align: center;
                ">

                    <a
                        href="${activationLink}"
                        style="
                            display: inline-block;
                            padding: 14px 28px;
                            background: #2563eb;
                            color: white;
                            text-decoration: none;
                            border-radius: 10px;
                            font-weight: bold;
                        "
                    >
                        Activate Doctor Account
                    </a>

                </div>

                <p>
                    This activation link is valid for
                    <strong>24 hours</strong>.
                </p>

                <p style="
                    color: #64748b;
                    font-size: 14px;
                ">
                    If the link expires, contact the
                    MediFind administrator and ask them
                    to resend your invitation.
                </p>

                <p>
                    Regards,<br>
                    <strong>MediFind</strong>
                </p>

            </div>
        `
    });

}

// =========================================================
// SEND APPOINTMENT STATUS EMAIL TO PATIENT
// =========================================================
async function sendAppointmentStatusEmail({
    patientEmail,
    patientName,
    doctorName,
    specialization,
    hospitalName,
    appointmentDate,
    appointmentTime,
    status,
    reason
}) {

    let subject;
    let statusText;


    // =====================================================
    // CONFIRMED
    // =====================================================

    if (status === "confirmed") {

        subject =
            "MediFind - Appointment Confirmed";

        statusText =
            "Your appointment has been confirmed by the doctor.";

    }


    // =====================================================
    // REJECTED
    // =====================================================

    else if (status === "rejected") {

        subject =
            "MediFind - Appointment Rejected";

        statusText =
            "Your appointment has been rejected by the doctor.";

    }


    // =====================================================
    // OTHER STATUS
    // =====================================================

    else {

        console.log(
            `No email required for appointment status: ${status}`
        );

        return false;

    }


    await transporter.sendMail({

        from:
            process.env.SMTP_FROM ||
            process.env.SMTP_USER,

        to:
            patientEmail,

        subject,

        text:
            `Hello ${patientName},\n\n` +

            `${statusText}\n\n` +

            `Doctor: ${doctorName}\n` +

            `Specialization: ${
                specialization || "Not specified"
            }\n` +

            `Hospital: ${
                hospitalName || "Not specified"
            }\n` +

            `Date: ${appointmentDate}\n` +

            `Time: ${appointmentTime}\n\n` +

            `Thank you for using MediFind.\n\n` +

            `MediFind`,

        html: `

            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 30px auto;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-radius: 16px;
                background: white;
            ">

                <h2 style="color:#2563eb;">
                    MediFind Appointment
                </h2>

                <p>
                    Hello <strong>${patientName}</strong>,
                </p>

                <p>
                    ${statusText}
                </p>

                <div style="
                    margin: 20px 0;
                    padding: 20px;
                    background: #f8fafc;
                    border-radius: 12px;
                ">

                    <p>
                        <strong>Doctor:</strong>
                        ${doctorName}
                    </p>

                    <p>
                        <strong>Specialization:</strong>
                        ${specialization || "Not specified"}
                    </p>

                    <p>
                        <strong>Hospital:</strong>
                        ${hospitalName || "Not specified"}
                    </p>

                    <p>
                        <strong>Date:</strong>
                        ${appointmentDate}
                    </p>

                    <p>
                        <strong>Time:</strong>
                        ${appointmentTime}
                    </p>

                </div>

                <p>
                    Thank you for using
                    <strong>MediFind</strong>.
                </p>

            </div>

        `
    });


    return true;

}

// =========================================================
// CREATE PATIENT NOTIFICATION
// =========================================================

async function createPatientNotification({
    userId,
    appointmentId,
    status,
    doctorName,
    appointmentDate,
    appointmentTime
}) {

    // Clean doctor name
    const cleanDoctorName = String(
        doctorName || "Doctor"
    )
        .replace(/^(Dr\.?\s*)+/i, "")
        .trim();

    const displayDoctorName =
        `Dr. ${cleanDoctorName}`;


    let type;
    let title;
    let message;


    // =====================================================
    // CONFIRMED
    // =====================================================

    if (status === "confirmed") {

        type = "appointment_confirmed";

        title = "Appointment Confirmed 🎉";

        message =
            `Your appointment with ${displayDoctorName} ` +
            `has been confirmed for ${appointmentDate} ` +
            `at ${appointmentTime}.`;
    }


    // =====================================================
    // REJECTED
    // =====================================================

    else if (status === "rejected") {

        type = "appointment_rejected";

        title = "Appointment Rejected";

        message =
            `Your appointment with ${displayDoctorName} ` +
            `has been rejected.`;
    }


    // =====================================================
    // COMPLETED
    // =====================================================

    else if (status === "completed") {

        type = "appointment_completed";

        title = "Appointment Completed";

        message =
            `Your appointment with ${displayDoctorName} ` +
            `has been completed.`;
    }


    // =====================================================
    // UNKNOWN STATUS
    // =====================================================

    else {

        console.log(
            `No notification required for status: ${status}`
        );

        return false;
    }


    // =====================================================
    // INSERT NOTIFICATION
    // =====================================================

    await pool.query(
        `
        INSERT INTO notifications (
            user_id,
            appointment_id,
            type,
            title,
            message
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5
        )
        `,
        [
            userId,
            appointmentId,
            type,
            title,
            message
        ]
    );


    console.log(
        `Notification created for patient ${userId}`
    );

    return true;
}

// =========================================================
// FORMAT DOCTOR FOR FRONTEND
// =========================================================

function toFrontendDoctor(row, index = 0) {

    return {

        id:
            Number(row.doctor_id),

        name:
            row.full_name,

        photo:
            row.photo ||
            doctorPhotos[
                index % doctorPhotos.length
            ],

        qualification:
            row.qualification ||
            "MBBS",

        experience:
            row.experience != null
                ? `${row.experience} years`
                : "Experience not available",

        specialization:
            row.specialization,

        availability:
            row.availability ||
            "Contact hospital for availability",

        fee:
            row.fee !== null &&
            row.fee !== undefined
                ? Number(row.fee)
                : 0,

        hospitalId:
            Number(row.hospital_id),

        hospitalName:
            row.hospital_name,

        phone:
            row.phone,

        email:
            row.email,

        emailVerified:
            row.email_verified === true

    };

}

// =========================================================
// GET ALL DOCTORS
// =========================================================
// =========================================================
// GET ALL DOCTORS
// =========================================================
export const getDoctors = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, h.hospital_name as hospital_name 
      FROM doctors d 
      LEFT JOIN hospitals h ON d.hospital_id = h.hospital_id
      ORDER BY d.doctor_id ASC
    `);

    // Transform backend snake_case rows to camelCase frontend objects
    const doctors = result.rows.map((row, index) => toFrontendDoctor(row, index));

    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// =========================================================
// ADD DOCTOR
// ADMIN CREATES DOCTOR ACCOUNT
// =========================================================

export const addDoctor = async (req, res) => {

    try {

        const {
            hospital_id,
            full_name,
            specialization,
            phone,
            email,
            experience,
            fee
        } = req.body;


        // =====================================================
        // VALIDATION
        // =====================================================

        if (
            !hospital_id ||
            !full_name ||
            !specialization ||
            !phone ||
            !email ||
            experience === undefined ||
            fee === undefined ||
            fee === null ||
            fee === ""
        ) {

            return res.status(400).json({
                message:
                    "Please fill all required fields."
            });

        }


        const experienceNumber =
            Number(experience);

        const feeNumber =
            Number(fee);


        if (
            !Number.isFinite(experienceNumber) ||
            experienceNumber < 0
        ) {

            return res.status(400).json({
                message:
                    "Experience must be a valid non-negative number."
            });

        }


        if (
            !Number.isFinite(feeNumber) ||
            feeNumber < 0
        ) {

            return res.status(400).json({
                message:
                    "Consultation fee must be a valid non-negative amount."
            });

        }


        const cleanEmail =
            email.trim().toLowerCase();

        const cleanName =
            full_name.trim();

        const cleanSpecialization =
            specialization.trim();

        const cleanPhone =
            phone.trim();


        // =====================================================
        // CHECK HOSPITAL
        // =====================================================

        const hospital =
            await pool.query(
                `
                SELECT hospital_id
                FROM hospitals
                WHERE hospital_id = $1
                `,
                [hospital_id]
            );


        if (!hospital.rows.length) {

            return res.status(404).json({
                message:
                    "Hospital not found."
            });

        }


        // =====================================================
        // CHECK EXISTING USER
        // =====================================================

        const existingUser =
            await pool.query(
                `
                SELECT
                    user_id,
                    full_name,
                    email,
                    role,
                    email_verified
                FROM users
                WHERE LOWER(TRIM(email)) =
                      LOWER(TRIM($1))
                LIMIT 1
                `,
                [cleanEmail]
            );


        let userId;

        let newUserCreated = false;


        // =====================================================
        // USER EXISTS
        // =====================================================

        if (existingUser.rows.length) {

            const user =
                existingUser.rows[0];

            userId =
                user.user_id;


            // ---------------------------------------------
            // Already doctor
            // ---------------------------------------------

            if (user.role === "doctor") {

                const existingDoctor =
                    await pool.query(
                        `
                        SELECT doctor_id
                        FROM doctors
                        WHERE user_id = $1
                           OR LOWER(TRIM(email)) =
                              LOWER(TRIM($2))
                        LIMIT 1
                        `,
                        [
                            userId,
                            cleanEmail
                        ]
                    );


                if (existingDoctor.rows.length) {

                    return res.status(409).json({
                        message:
                            "This user is already registered as a doctor."
                    });

                }

            }

        }


        // =====================================================
        // USER DOES NOT EXIST
        // CREATE USER
        // =====================================================

        else {

            const randomPassword =
                crypto
                    .randomBytes(32)
                    .toString("hex");


            const hashedPassword =
                await bcrypt.hash(
                    randomPassword,
                    10
                );


            const newUser =
                await pool.query(
                    `
                    INSERT INTO users (
                        full_name,
                        email,
                        password,
                        role,
                        email_verified,
                        account_status
                    )

                    VALUES (
                        $1,
                        $2,
                        $3,
                        'doctor',
                        FALSE,
                        'pending'
                    )

                    RETURNING user_id
                    `,
                    [
                        cleanName,
                        cleanEmail,
                        hashedPassword
                    ]
                );


            userId =
                newUser.rows[0].user_id;

            newUserCreated = true;

        }


        // =====================================================
        // GENERATE INVITATION TOKEN
        // =====================================================

        const invitationToken =
            crypto
                .randomBytes(48)
                .toString("hex");


        const invitationTokenHash =
            crypto
                .createHash("sha256")
                .update(invitationToken)
                .digest("hex");


        // 24 hours

        const invitationExpiry =
            new Date(
                Date.now() +
                24 * 60 * 60 * 1000
            );


        // =====================================================
        // CREATE / UPDATE USER
        // =====================================================

        await pool.query(
            `
            UPDATE users

            SET
                role = 'doctor',
                account_status = 'pending',
                email_verified = FALSE,
                invitation_token_hash = $1,
                invitation_expires_at = $2

            WHERE user_id = $3
            `,
            [
                invitationTokenHash,
                invitationExpiry,
                userId
            ]
        );


        // =====================================================
        // CREATE DOCTOR PROFILE
        // =====================================================

        const result =
            await pool.query(
                `
                INSERT INTO doctors (
                    hospital_id,
                    user_id,
                    full_name,
                    specialization,
                    phone,
                    email,
                    experience,
                    fee,
                    email_verified,
                    verification_otp,
                    verification_otp_expires_at,
                    verification_attempts
                )

                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    FALSE,
                    NULL,
                    NULL,
                    0
                )

                RETURNING
                    doctor_id,
                    hospital_id,
                    user_id,
                    full_name,
                    specialization,
                    phone,
                    email,
                    experience,
                    fee,
                    email_verified
                `,
                [
                    hospital_id,
                    userId,
                    cleanName,
                    cleanSpecialization,
                    cleanPhone,
                    cleanEmail,
                    experienceNumber,
                    feeNumber
                ]
            );


        // =====================================================
        // ACTIVATION LINK
        // =====================================================

        const frontendURL =
            process.env.FRONTEND_URL ||
            "http://localhost:5173";


        const activationLink =
            `${frontendURL}/doctor/activate?token=${invitationToken}`;


        // =====================================================
        // SEND INVITATION
        // =====================================================

        try {

            await sendDoctorInvitationEmail({

                email:
                    cleanEmail,

                fullName:
                    cleanName,

                activationLink

            });

        } catch (emailError) {

            console.error(
                "Doctor invitation email error:",
                emailError
            );


            // Remove doctor

            await pool.query(
                `
                DELETE FROM doctors
                WHERE doctor_id = $1
                `,
                [
                    result.rows[0].doctor_id
                ]
            );


            // Remove newly created user

            if (newUserCreated) {

                await pool.query(
                    `
                    DELETE FROM users
                    WHERE user_id = $1
                    `,
                    [userId]
                );

            }


            return res.status(500).json({

                message:
                    "Doctor could not be added because the invitation email could not be sent.",

                error:
                    emailError.message

            });

        }


        // =====================================================
        // SUCCESS
        // =====================================================

        return res.status(201).json({

            message:
                "Doctor added successfully. An account activation link has been sent to the doctor's email.",

            doctor:
                result.rows[0],

            activationRequired:
                true

        });


    } catch (err) {

        console.error(
            "Error adding doctor:",
            err
        );


        return res.status(500).json({

            message:
                "Error adding doctor.",

            error:
                err.message

        });

    }

};

// =========================================================
// ACTIVATE DOCTOR ACCOUNT
// =========================================================

export const activateDoctorAccount = async (
    req,
    res
) => {

    try {

        const {
            token,
            password
        } = req.body;


        // =====================================================
        // VALIDATION
        // =====================================================

        if (!token || !password) {

            return res.status(400).json({
                message:
                    "Activation token and password are required."
            });

        }


        if (password.length < 6) {

            return res.status(400).json({
                message:
                    "Password must be at least 6 characters."
            });

        }


        // =====================================================
        // HASH TOKEN
        // =====================================================

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        // =====================================================
        // FIND USER
        // =====================================================

        const userResult =
            await pool.query(
                `
                SELECT
                    user_id,
                    email,
                    role,
                    account_status,
                    invitation_expires_at

                FROM users

                WHERE invitation_token_hash = $1

                LIMIT 1
                `,
                [tokenHash]
            );


        if (!userResult.rows.length) {

            return res.status(400).json({
                message:
                    "Invalid or expired activation link."
            });

        }


        const user =
            userResult.rows[0];


        // =====================================================
        // CHECK EXPIRY
        // =====================================================

        if (
            !user.invitation_expires_at ||
            new Date(
                user.invitation_expires_at
            ) < new Date()
        ) {

            return res.status(400).json({
                message:
                    "This activation link has expired. Please contact the administrator to resend your invitation."
            });

        }


        // =====================================================
        // HASH PASSWORD
        // =====================================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // =====================================================
        // ACTIVATE ACCOUNT
        // =====================================================

        const result =
            await pool.query(
                `
                UPDATE users

                SET
                    password = $1,
                    role = 'doctor',
                    account_status = 'active',
                    email_verified = TRUE,
                    invitation_token_hash = NULL,
                    invitation_expires_at = NULL

                WHERE user_id = $2

                RETURNING
                    user_id,
                    email,
                    role,
                    email_verified,
                    account_status
                `,
                [
                    hashedPassword,
                    user.user_id
                ]
            );


        // =====================================================
        // UPDATE DOCTOR
        // =====================================================

        await pool.query(
            `
            UPDATE doctors

            SET
                email_verified = TRUE,
                verification_otp = NULL,
                verification_otp_expires_at = NULL,
                verification_attempts = 0,
                verified_at = NOW()

            WHERE user_id = $1
            `,
            [
                user.user_id
            ]
        );


        // =====================================================
        // SUCCESS
        // =====================================================

        return res.status(200).json({

            message:
                "Doctor account activated successfully. You can now login.",

            user:
                result.rows[0]

        });


    } catch (err) {

        console.error(
            "Doctor account activation error:",
            err
        );


        return res.status(500).json({

            message:
                "Error activating doctor account.",

            error:
                err.message

        });

    }

};

// =========================================================
// VERIFY DOCTOR EMAIL + CREATE PASSWORD
// =========================================================

export const verifyDoctorEmail = async (req, res) => {

    const client = await pool.connect();

    try {

        const {
            email,
            otp,
            password
        } = req.body;


        // =====================================================
        // REQUIRED FIELDS
        // =====================================================

        if (!email || !otp || !password) {

            return res.status(400).json({
                message:
                    "Email, OTP and password are required."
            });

        }


        // =====================================================
        // CLEAN DATA
        // =====================================================

        const cleanEmail =
            email.trim().toLowerCase();

        const cleanOTP =
            otp.trim();


        // =====================================================
        // OTP VALIDATION
        // =====================================================

        if (!/^\d{6}$/.test(cleanOTP)) {

            return res.status(400).json({
                message:
                    "OTP must be exactly 6 digits."
            });

        }


        // =====================================================
        // PASSWORD VALIDATION
        // =====================================================

        if (password.length < 6) {

            return res.status(400).json({
                message:
                    "Password must be at least 6 characters."
            });

        }


        // =====================================================
        // FIND DOCTOR
        // =====================================================

        const doctor =
            await pool.query(
                `
                SELECT
                    doctor_id,
                    user_id,
                    full_name,
                    email,
                    email_verified,
                    verification_otp,
                    verification_otp_expires_at,
                    verification_attempts

                FROM doctors

                WHERE LOWER(TRIM(email)) =
                      LOWER(TRIM($1))

                LIMIT 1
                `,
                [cleanEmail]
            );


        // =====================================================
        // DOCTOR NOT FOUND
        // =====================================================

        if (!doctor.rows.length) {

            return res.status(404).json({
                message:
                    "Doctor email not found."
            });

        }


        const doctorData =
            doctor.rows[0];


        // =====================================================
        // ALREADY VERIFIED
        // =====================================================

        if (doctorData.email_verified) {

            return res.status(400).json({
                message:
                    "This doctor's email is already verified."
            });

        }


        // =====================================================
        // MAX OTP ATTEMPTS
        // =====================================================

        if (
            Number(
                doctorData.verification_attempts || 0
            ) >= 5
        ) {

            return res.status(429).json({
                message:
                    "Too many incorrect OTP attempts. Please request a new OTP."
            });

        }


        // =====================================================
        // CHECK OTP EXPIRY
        // =====================================================

        if (
            !doctorData.verification_otp_expires_at ||
            new Date(
                doctorData.verification_otp_expires_at
            ) < new Date()
        ) {

            return res.status(400).json({
                message:
                    "OTP has expired. Please request a new OTP."
            });

        }


        // =====================================================
        // HASH ENTERED OTP
        // =====================================================

        const hashedOTP =
            hashOTP(cleanOTP);


        // =====================================================
        // CHECK OTP
        // =====================================================

        if (
            hashedOTP !==
            doctorData.verification_otp
        ) {

            await pool.query(
                `
                UPDATE doctors

                SET
                    verification_attempts =
                        COALESCE(
                            verification_attempts,
                            0
                        ) + 1

                WHERE doctor_id = $1
                `,
                [
                    doctorData.doctor_id
                ]
            );


            return res.status(400).json({
                message:
                    "Invalid OTP."
            });

        }


        // =====================================================
        // HASH NEW PASSWORD
        // =====================================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // =====================================================
        // START TRANSACTION
        // =====================================================

        await client.query("BEGIN");


        // =====================================================
        // VERIFY DOCTOR
        // =====================================================

        const result =
            await client.query(
                `
                UPDATE doctors

                SET
                    email_verified = TRUE,
                    verification_otp = NULL,
                    verification_otp_expires_at = NULL,
                    verification_attempts = 0,
                    verified_at = NOW()

                WHERE doctor_id = $1

                RETURNING
                    doctor_id,
                    user_id,
                    full_name,
                    email,
                    email_verified,
                    verified_at
                `,
                [
                    doctorData.doctor_id
                ]
            );


        // =====================================================
        // CHECK UPDATED DOCTOR
        // =====================================================

        if (!result.rows.length) {

            throw new Error(
                "Unable to verify doctor account."
            );

        }


        const verifiedDoctor =
            result.rows[0];


        // =====================================================
        // UPDATE LINKED USER ACCOUNT
        // =====================================================

        if (verifiedDoctor.user_id) {

            await client.query(
                `
                UPDATE users

                SET
                    password = $1,
                    email_verified = TRUE,
                    role = 'doctor'

                WHERE user_id = $2
                `,
                [
                    hashedPassword,
                    verifiedDoctor.user_id
                ]
            );

        } else {

            // -------------------------------------------------
            // Safety fallback:
            // Find the user using the doctor's email.
            // -------------------------------------------------

            const userResult =
                await client.query(
                    `
                    UPDATE users

                    SET
                        password = $1,
                        email_verified = TRUE,
                        role = 'doctor'

                    WHERE LOWER(TRIM(email)) =
                          LOWER(TRIM($2))

                    RETURNING user_id
                    `,
                    [
                        hashedPassword,
                        cleanEmail
                    ]
                );


            if (!userResult.rows.length) {

                throw new Error(
                    "Doctor verified, but linked user account was not found."
                );

            }


            // Repair the doctor → user relationship

            await client.query(
                `
                UPDATE doctors

                SET user_id = $1

                WHERE doctor_id = $2
                `,
                [
                    userResult.rows[0].user_id,
                    verifiedDoctor.doctor_id
                ]
            );

        }


        // =====================================================
        // COMMIT
        // =====================================================

        await client.query("COMMIT");


        // =====================================================
        // SUCCESS
        // =====================================================

        return res.status(200).json({

            message:
                "Doctor email verified and password created successfully.",

            doctor:
                verifiedDoctor

        });


    } catch (err) {

        // =====================================================
        // ROLLBACK
        // =====================================================

        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            console.error(
                "Rollback error:",
                rollbackError
            );
        }


        console.error(
            "Doctor email verification error:",
            err
        );


        return res.status(500).json({

            message:
                "Error verifying doctor email.",

            error:
                err.message

        });


    } finally {

        client.release();

    }

};

// =========================================================
// RESEND DOCTOR VERIFICATION OTP
// =========================================================

export const resendDoctorVerificationOTP = async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Doctor email is required."
            });
        }

        const cleanEmail =
            email.trim().toLowerCase();

        // Find doctor
        const result = await pool.query(
            `
            SELECT
                doctor_id,
                full_name,
                email,
                email_verified
            FROM doctors
            WHERE LOWER(TRIM(email)) =
                  LOWER(TRIM($1))
            LIMIT 1
            `,
            [cleanEmail]
        );

        if (!result.rows.length) {
            return res.status(404).json({
                message:
                    "Doctor email not found."
            });
        }

        const doctor =
            result.rows[0];

        // Already verified
        if (doctor.email_verified) {
            return res.status(400).json({
                message:
                    "Doctor email is already verified."
            });
        }

        // Generate new OTP
        const otp =
            generateOTP();

        const hashedOTP =
            hashOTP(otp);

        const expiry =
            getOTPExpiry();

        // Save OTP
        await pool.query(
            `
            UPDATE doctors

            SET
                verification_otp = $1,
                verification_otp_expires_at = $2,
                verification_attempts = 0

            WHERE doctor_id = $3
            `,
            [
                hashedOTP,
                expiry,
                doctor.doctor_id
            ]
        );

        // Send email
        await sendDoctorVerificationEmail({
            email: doctor.email,
            fullName: doctor.full_name,
            otp
        });

        return res.status(200).json({
            message:
                "A new verification OTP has been sent to the doctor's email."
        });

    } catch (err) {

        console.error(
            "Resend doctor OTP error:",
            err
        );

        return res.status(500).json({
            message:
                "Unable to resend doctor verification OTP.",
            error:
                err.message
        });

    }

};

// =========================================================
// UPDATE DOCTOR
// =========================================================

export const updateDoctor = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            hospital_id,
            user_id,
            full_name,
            specialization,
            phone,
            email,
            experience,
            fee
        } = req.body;


        // =====================================================
        // VALIDATION
        // =====================================================

        if (
            !hospital_id ||
            !full_name ||
            !specialization ||
            !phone ||
            !email ||
            experience === undefined ||
            fee === undefined ||
            fee === null ||
            fee === ""
        ) {

            return res.status(400).json({
                message:
                    "Please fill all required fields."
            });

        }


        // =====================================================
        // EXPERIENCE VALIDATION
        // =====================================================

        const experienceNumber =
            Number(experience);

        if (
            !Number.isFinite(experienceNumber) ||
            experienceNumber < 0
        ) {

            return res.status(400).json({
                message:
                    "Experience must be a valid non-negative number."
            });

        }


        // =====================================================
        // FEE VALIDATION
        // =====================================================

        const feeNumber =
            Number(fee);

        if (
            !Number.isFinite(feeNumber) ||
            feeNumber < 0
        ) {

            return res.status(400).json({
                message:
                    "Consultation fee must be a valid non-negative amount."
            });

        }


        // =====================================================
        // CLEAN DATA
        // =====================================================

        const cleanName =
            full_name.trim();

        const cleanSpecialization =
            specialization.trim();

        const cleanPhone =
            phone.trim();

        const cleanEmail =
            email.trim().toLowerCase();


        // =====================================================
        // GET EXISTING DOCTOR
        // =====================================================

        const oldDoctor =
            await pool.query(
                `
                SELECT
                    doctor_id,
                    user_id,
                    email,
                    email_verified
                FROM doctors
                WHERE doctor_id = $1
                LIMIT 1
                `,
                [id]
            );


        // =====================================================
        // DOCTOR NOT FOUND
        // =====================================================

        if (
            oldDoctor.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Doctor not found."
            });

        }


        const oldDoctorData =
            oldDoctor.rows[0];


        const oldEmail =
            (oldDoctorData.email || "")
                .trim()
                .toLowerCase();


        // =====================================================
        // CHECK IF EMAIL CHANGED
        // =====================================================

        const emailChanged =
            oldEmail !== cleanEmail;


        // =====================================================
        // EMAIL CHANGED
        // NEW VERIFICATION REQUIRED
        // =====================================================

        if (emailChanged) {

            // -------------------------------------------------
            // CHECK DUPLICATE DOCTOR EMAIL
            // -------------------------------------------------

            const duplicateDoctor =
                await pool.query(
                    `
                    SELECT
                        doctor_id
                    FROM doctors
                    WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
                    AND doctor_id <> $2
                    LIMIT 1
                    `,
                    [
                        cleanEmail,
                        id
                    ]
                );


            if (
                duplicateDoctor.rows.length > 0
            ) {

                return res.status(409).json({
                    message:
                        "Another doctor already uses this email."
                });

            }


            // -------------------------------------------------
            // GENERATE NEW OTP
            // -------------------------------------------------

            const otp =
                generateOTP();

            const verificationOTP =
                hashOTP(otp);

            const verificationExpiry =
                getOTPExpiry();


            // -------------------------------------------------
            // UPDATE DOCTOR
            // EMAIL WILL NEED VERIFICATION
            // -------------------------------------------------

            const result =
                await pool.query(
                    `
                    UPDATE doctors

                    SET
                        hospital_id = $1,
                        user_id = $2,
                        full_name = $3,
                        specialization = $4,
                        phone = $5,
                        email = $6,
                        experience = $7,
                        fee = $8,

                        email_verified = FALSE,

                        verification_otp = $9,
                        verification_otp_expires_at = $10,

                        verification_attempts = 0,
                        verified_at = NULL

                    WHERE doctor_id = $11

                    RETURNING *
                    `,
                    [
                        hospital_id,

                        user_id ||
                        oldDoctorData.user_id ||
                        null,

                        cleanName,

                        cleanSpecialization,

                        cleanPhone,

                        cleanEmail,

                        experienceNumber,

                        feeNumber,

                        verificationOTP,

                        verificationExpiry,

                        id
                    ]
                );


            // -------------------------------------------------
            // SEND VERIFICATION EMAIL
            // -------------------------------------------------

            try {

                await sendDoctorVerificationEmail({
                    email: cleanEmail,
                    fullName: cleanName,
                    otp
                });

            } catch (emailError) {

                console.error(
                    "Doctor verification email error:",
                    emailError
                );

                return res.status(500).json({
                    message:
                        "Doctor was updated, but the verification email could not be sent.",
                    error:
                        emailError.message
                });

            }


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return res.status(200).json({

                message:
                    "Doctor updated successfully. New email verification is required.",

                doctor:
                    result.rows[0],

                verificationRequired:
                    true

            });

        }


        // =====================================================
        // NORMAL UPDATE
        // EMAIL DID NOT CHANGE
        // =====================================================

        const result =
            await pool.query(
                `
                UPDATE doctors

                SET
                    hospital_id = $1,
                    user_id = $2,
                    full_name = $3,
                    specialization = $4,
                    phone = $5,
                    email = $6,
                    experience = $7,
                    fee = $8

                WHERE doctor_id = $9

                RETURNING *
                `,
                [
                    hospital_id,

                    user_id ||
                    oldDoctorData.user_id ||
                    null,

                    cleanName,

                    cleanSpecialization,

                    cleanPhone,

                    cleanEmail,

                    experienceNumber,

                    feeNumber,

                    id
                ]
            );


        // =====================================================
        // CHECK UPDATE
        // =====================================================

        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Doctor not found."
            });

        }


        // =====================================================
        // SUCCESS
        // =====================================================

        return res.status(200).json({

            message:
                "Doctor updated successfully.",

            doctor:
                result.rows[0]

        });


    } catch (err) {

        console.error(
            "Error updating doctor:",
            err
        );

        return res.status(500).json({

            message:
                "Error updating doctor",

            error:
                err.message

        });

    }

};

// =========================================================
// DELETE DOCTOR
// =========================================================

// =========================================================
// DELETE DOCTOR
// =========================================================

export const deleteDoctor = async (req, res) => {

    const client = await pool.connect();

    try {

        const doctorId = Number(req.params.id);

        // -----------------------------------------------------
        // VALIDATE DOCTOR ID
        // -----------------------------------------------------

        if (!Number.isInteger(doctorId) || doctorId <= 0) {

            return res.status(400).json({
                message: "Invalid doctor ID."
            });

        }

        await client.query("BEGIN");

        // -----------------------------------------------------
        // CHECK DOCTOR EXISTS
        // -----------------------------------------------------

        const doctorResult = await client.query(
            `
            SELECT
                doctor_id,
                user_id,
                full_name,
                email
            FROM doctors
            WHERE doctor_id = $1
            FOR UPDATE
            `,
            [doctorId]
        );

        if (doctorResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Doctor not found."
            });

        }

        const doctor = doctorResult.rows[0];

        // -----------------------------------------------------
        // DELETE APPOINTMENTS OF THIS DOCTOR
        // -----------------------------------------------------

        await client.query(
            `
            DELETE FROM appointments
            WHERE doctor_id = $1
            `,
            [doctorId]
        );

        // -----------------------------------------------------
        // DELETE DOCTOR
        // -----------------------------------------------------

        const deleteResult = await client.query(
            `
            DELETE FROM doctors
            WHERE doctor_id = $1
            RETURNING *
            `,
            [doctorId]
        );

        if (deleteResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Doctor not found."
            });

        }

        // -----------------------------------------------------
        // COMMIT
        // -----------------------------------------------------

        await client.query("COMMIT");

        console.log(
            `Doctor deleted successfully: ${doctor.full_name} (ID: ${doctorId})`
        );

        return res.status(200).json({

            message: "Doctor deleted successfully",

            doctor: deleteResult.rows[0]

        });

    } catch (err) {

        // -----------------------------------------------------
        // ROLLBACK IF ANY ERROR OCCURS
        // -----------------------------------------------------

        try {

            await client.query("ROLLBACK");

        } catch (rollbackError) {

            console.error(
                "Rollback error while deleting doctor:",
                rollbackError
            );

        }

        console.error(
            "Error deleting doctor:",
            err
        );

        return res.status(500).json({

            message: "Error deleting doctor",

            error: err.message

        });

    } finally {

        client.release();

    }

};
// =========================================================
// GET LOGGED-IN DOCTOR PROFILE
// =========================================================

export const getMyProfile = async (req, res) => {

    try {

        const userId =
            req.user.user_id;

        const userEmail =
            req.user.email;

        // =====================================================
        // FIND DOCTOR
        // First by user_id
        // Fallback by email
        // =====================================================

        const result =
            await pool.query(
                `
                SELECT
                    d.doctor_id,
                    d.user_id,
                    d.hospital_id,
                    d.full_name,
                    d.specialization,
                    d.phone,
                    d.email,
                    d.experience,
                    d.email_verified,
                    d.verified_at,

                    h.hospital_name,
                    h.address,
                    h.city,
                    h.contact_number AS hospital_contact,
                    h.email AS hospital_email

                FROM doctors d

                LEFT JOIN hospitals h
                    ON d.hospital_id = h.hospital_id

                WHERE
                    d.user_id = $1
                    OR LOWER(TRIM(d.email))
                       = LOWER(TRIM($2))

                LIMIT 1
                `,
                [
                    userId,
                    userEmail
                ]
            );

        // =====================================================
        // NOT FOUND
        // =====================================================

        if (result.rows.length === 0) {

            return res.status(404).json({
                message:
                    "Doctor profile not found."
            });

        }

        const doctor =
            result.rows[0];

        // =====================================================
        // REPAIR USER LINK IF NEEDED
        // =====================================================

        if (
            !doctor.user_id ||
            Number(doctor.user_id) !== Number(userId)
        ) {

            await pool.query(
                `
                UPDATE doctors
                SET user_id = $1
                WHERE doctor_id = $2
                `,
                [
                    userId,
                    doctor.doctor_id
                ]
            );

            doctor.user_id =
                userId;
        }

        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(200).json({
            doctor
        });

    } catch (err) {

        console.error(
            "Get doctor profile error:",
            err
        );

        return res.status(500).json({
            message:
                "Error loading doctor profile.",
            error:
                err.message
        });
    }
};

// =========================================================
// DOCTOR APPOINTMENTS
// =========================================================

export const getMyAppointments = async (
    req,
    res
) => {

    try {

        const result =
            await pool.query(
                `
                SELECT
                    a.appointment_id,
                    a.patient_id,
                    u.full_name AS patient_name,
                    u.email AS patient_email,
                    u.phone AS patient_phone,
                    a.doctor_id,
                    d.full_name AS doctor_name,
                    d.specialization,
                    h.hospital_name,
                    a.appointment_date,
                    a.appointment_time,
                    a.reason,
                    a.status

                FROM appointments a

                LEFT JOIN users u
                    ON a.patient_id = u.user_id

                LEFT JOIN doctors d
                    ON a.doctor_id = d.doctor_id

                LEFT JOIN hospitals h
                    ON d.hospital_id = h.hospital_id

                WHERE d.user_id = $1

                ORDER BY
                    a.appointment_date ASC,
                    a.appointment_time ASC
                `,
                [req.user.user_id]
            );


        return res.status(200).json({

            appointments:
                result.rows

        });


    } catch (err) {

        console.error(
            "Doctor appointments error:",
            err
        );

        return res.status(500).json({

            message:
                "Error fetching doctor appointments",

            error:
                err.message

        });

    }

};

// =========================================================
// UPDATE DOCTOR APPOINTMENT STATUS
// FAST VERSION
// =========================================================

export const updateMyAppointmentStatus = async (
    req,
    res
) => {

    try {

        const { id } = req.params;
        const { status } = req.body;


        // =====================================================
        // ALLOWED STATUSES
        // =====================================================

        const allowedStatuses = [
            "confirmed",
            "rejected",
            "completed"
        ];


        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({
                message:
                    "Invalid appointment status."
            });

        }


        // =====================================================
        // GET APPOINTMENT
        // VERIFY IT BELONGS TO LOGGED-IN DOCTOR
        // =====================================================

        const appointmentResult =
            await pool.query(
                `
                SELECT

                    a.appointment_id,
                    a.patient_id,
                    a.doctor_id,
                    a.appointment_date,
                    a.appointment_time,
                    a.reason,
                    a.status,

                    u.full_name AS patient_name,
                    u.email AS patient_email,

                    d.full_name AS doctor_name,
                    d.specialization,

                    h.hospital_name

                FROM appointments a

                LEFT JOIN users u
                    ON a.patient_id = u.user_id

                LEFT JOIN doctors d
                    ON a.doctor_id = d.doctor_id

                LEFT JOIN hospitals h
                    ON d.hospital_id = h.hospital_id

                WHERE
                    a.appointment_id = $1

                    AND d.user_id = $2

                LIMIT 1
                `,
                [
                    id,
                    req.user.user_id
                ]
            );


        // =====================================================
        // APPOINTMENT NOT FOUND
        // =====================================================

        if (!appointmentResult.rows.length) {

            return res.status(404).json({

                message:
                    "Appointment not found or not assigned to you."

            });

        }


        const appointment =
            appointmentResult.rows[0];


        // =====================================================
        // PREVENT INVALID STATUS CHANGES
        // =====================================================

        if (appointment.status === "completed") {

            return res.status(400).json({

                message:
                    "This appointment is already completed."

            });

        }


        if (
            appointment.status === "rejected" &&
            status !== "rejected"
        ) {

            return res.status(400).json({

                message:
                    "This appointment has already been rejected."

            });

        }


        // =====================================================
        // COMPLETED ONLY FROM CONFIRMED
        // =====================================================

        if (
            status === "completed" &&
            appointment.status !== "confirmed"
        ) {

            return res.status(400).json({

                message:
                    "Only confirmed appointments can be marked as completed."

            });

        }


        // =====================================================
        // UPDATE DATABASE FIRST
        // =====================================================

        const result =
            await pool.query(
                `
                UPDATE appointments

                SET status = $1

                WHERE appointment_id = $2

                RETURNING
                    appointment_id,
                    patient_id,
                    doctor_id,
                    appointment_date,
                    appointment_time,
                    reason,
                    status
                `,
                [
                    status,
                    id
                ]
            );


        let message;


        if (status === "confirmed") {

            message =
                "Appointment accepted successfully.";

        }

        else if (status === "rejected") {

            message =
                "Appointment rejected successfully.";

        }

        else {

            message =
                "Appointment marked as completed.";

        }


        // =====================================================
        // SEND RESPONSE NOW
        // =====================================================

        res.status(200).json({

            message,

            appointment:
                result.rows[0],

            emailSent:
                false,

            notificationCreated:
                false

        });


        // =====================================================
        // BACKGROUND EMAIL
        // =====================================================

        if (
            appointment.patient_email &&
            (
                status === "confirmed" ||
                status === "rejected"
            )
        ) {

            sendAppointmentStatusEmail({

                patientEmail:
                    appointment.patient_email,

                patientName:
                    appointment.patient_name ||
                    "Patient",

                doctorName:
                    appointment.doctor_name ||
                    "Doctor",

                specialization:
                    appointment.specialization,

                hospitalName:
                    appointment.hospital_name,

                appointmentDate:
                    appointment.appointment_date,

                appointmentTime:
                    appointment.appointment_time,

                status,

                reason:
                    appointment.reason

            })

            .then(() => {

                console.log(
                    `Appointment ${id} email sent successfully.`
                );

            })

            .catch((emailError) => {

                console.error(
                    `Appointment ${id} email error:`,
                    emailError
                );

            });

        }


        // =====================================================
        // BACKGROUND NOTIFICATION
        // =====================================================

        createPatientNotification({

            userId:
                appointment.patient_id,

            appointmentId:
                appointment.appointment_id,

            status,

            doctorName:
                appointment.doctor_name ||
                "Doctor",

            appointmentDate:
                appointment.appointment_date,

            appointmentTime:
                appointment.appointment_time

        })

        .then(() => {

            console.log(
                `Appointment ${id} notification created successfully.`
            );

        })

        .catch((notificationError) => {

            console.error(
                `Appointment ${id} notification error:`,
                notificationError
            );

        });


    } catch (err) {

        console.error(
            "Appointment status update error:",
            err
        );


        if (!res.headersSent) {

            return res.status(500).json({

                message:
                    "Error updating appointment status.",

                error:
                    err.message

            });

        }

    }

};

// =========================================================
// RESEND DOCTOR ACCOUNT INVITATION
// ADMIN ONLY
// =========================================================

export const resendDoctorInvitation = async (
    req,
    res
) => {

    try {

        const { email } = req.body;

        // =====================================================
        // VALIDATE EMAIL
        // =====================================================

        if (!email) {

            return res.status(400).json({
                message:
                    "Doctor email is required."
            });

        }

        const cleanEmail =
            email.trim().toLowerCase();


        // =====================================================
        // FIND DOCTOR + USER
        // =====================================================

        const result =
            await pool.query(
                `
                SELECT
                    u.user_id,
                    u.email,
                    u.role,
                    u.account_status,

                    d.doctor_id,
                    d.full_name

                FROM users u

                INNER JOIN doctors d
                    ON d.user_id = u.user_id

                WHERE LOWER(TRIM(u.email)) =
                      LOWER(TRIM($1))

                LIMIT 1
                `,
                [cleanEmail]
            );


        // =====================================================
        // DOCTOR NOT FOUND
        // =====================================================

        if (!result.rows.length) {

            return res.status(404).json({
                message:
                    "Doctor account not found."
            });

        }


        const doctor =
            result.rows[0];


        // =====================================================
        // ALREADY ACTIVE
        // =====================================================

        if (
            doctor.account_status === "active"
        ) {

            return res.status(400).json({
                message:
                    "This doctor account is already active."
            });

        }


        // =====================================================
        // GENERATE NEW INVITATION TOKEN
        // =====================================================

        const invitationToken =
            crypto
                .randomBytes(48)
                .toString("hex");


        // =====================================================
        // HASH TOKEN
        // =====================================================

        const invitationTokenHash =
            crypto
                .createHash("sha256")
                .update(invitationToken)
                .digest("hex");


        // =====================================================
        // TOKEN VALID FOR 24 HOURS
        // =====================================================

        const invitationExpiry =
            new Date(
                Date.now() +
                24 * 60 * 60 * 1000
            );


        // =====================================================
        // SAVE NEW INVITATION
        // =====================================================

        await pool.query(
            `
            UPDATE users

            SET
                invitation_token_hash = $1,
                invitation_expires_at = $2,
                account_status = 'pending'

            WHERE user_id = $3
            `,
            [
                invitationTokenHash,
                invitationExpiry,
                doctor.user_id
            ]
        );


        // =====================================================
        // CREATE ACTIVATION LINK
        // =====================================================

        const frontendURL =
            process.env.FRONTEND_URL ||
            "http://localhost:5173";


        const activationLink =
            `${frontendURL}/doctor/activate?token=${invitationToken}`;


        // =====================================================
        // SEND INVITATION EMAIL
        // =====================================================

        await sendDoctorInvitationEmail({

            email:
                doctor.email,

            fullName:
                doctor.full_name,

            activationLink

        });


        // =====================================================
        // SUCCESS
        // =====================================================

        return res.status(200).json({

            message:
                "A new doctor account activation invitation has been sent."

        });


    } catch (err) {

        console.error(
            "Resend doctor invitation error:",
            err
        );


        return res.status(500).json({

            message:
                "Unable to resend doctor invitation.",

            error:
                err.message

        });

    }

};