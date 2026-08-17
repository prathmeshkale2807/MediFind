import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

// =========================================================
// EMAIL TRANSPORTER
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
// GENERATE 6 DIGIT OTP
// =========================================================

const generateOTP = () => {

    return crypto
        .randomInt(100000, 1000000)
        .toString();

};


// =========================================================
// HASH OTP
// =========================================================

const hashOTP = (otp) => {

    return crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

};


// =========================================================
// OTP EXPIRY
// 10 MINUTES
// =========================================================

const getOTPExpiry = () => {

    return new Date(
        Date.now() + 10 * 60 * 1000
    );

};

// =========================================================
// SEND OTP EMAIL
// =========================================================

const sendOTPEmail = async ({
    email,
    fullName,
    otp,
    type
}) => {

    let subject = "";
    let title = "";
    let message = "";

    // =====================================================
    // NORMAL REGISTRATION
    // =====================================================

    if (type === "registration") {

        subject =
            "MediFind - Verify Your Email";

        title =
            "Verify Your MediFind Account";

        message =
            "Use the OTP below to verify your email address and complete your registration.";

    }

    // =====================================================
    // DOCTOR LOGIN VERIFICATION
    // =====================================================

    else if (type === "doctor-login") {

        subject =
            "MediFind - Doctor Login Verification OTP";

        title =
            "Verify Your Doctor Login";

        message =
            "An administrator has added your doctor profile to MediFind. Enter this OTP to verify your email and continue to your doctor portal.";

    }

    // =====================================================
    // PASSWORD RESET
    // =====================================================

    else {

        subject =
            "MediFind - Password Reset OTP";

        title =
            "Reset Your MediFind Password";

        message =
            "Use the OTP below to verify your identity and reset your password.";

    }


    await transporter.sendMail({

        from:
            process.env.SMTP_FROM ||
            process.env.SMTP_USER,

        to:
            email,

        subject,

        text:
            `Hello ${fullName},\n\n` +
            `${message}\n\n` +
            `Your OTP is: ${otp}\n\n` +
            `This OTP will expire in 10 minutes.\n\n` +
            `If you did not request this, please ignore this email.\n\n` +
            `MediFind`,

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 30px auto;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                background: #ffffff;
            ">

                <h2 style="
                    color:#2563eb;
                ">
                    ${title}
                </h2>

                <p>
                    Hello ${fullName},
                </p>

                <p>
                    ${message}
                </p>

                <div style="
                    margin: 25px 0;
                    padding: 18px;
                    background:#f1f5f9;
                    border-radius:10px;
                    text-align:center;
                ">

                    <div style="
                        font-size:13px;
                        color:#64748b;
                        margin-bottom:8px;
                    ">
                        Your OTP
                    </div>

                    <strong style="
                        font-size:32px;
                        letter-spacing:8px;
                        color:#2563eb;
                    ">
                        ${otp}
                    </strong>

                </div>

                <p>
                    This OTP will expire in
                    <strong>10 minutes</strong>.
                </p>

                <p style="
                    color:#64748b;
                ">
                    If you did not request this,
                    you can safely ignore this email.
                </p>

                <p>
                    Regards,<br>
                    <strong>MediFind</strong>
                </p>

            </div>
        `
    });

};
// =========================================================
// REGISTER USER
// =========================================================

export const registerUser = async (req, res) => {

    try {

        const {
            full_name,
            email,
            password
        } = req.body;


        // -----------------------------------------
        // CHECK REQUIRED FIELDS
        // -----------------------------------------

        if (
            !full_name ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                message:
                    "All required fields must be provided."

            });

        }


        // -----------------------------------------
        // PASSWORD LENGTH
        // -----------------------------------------

        if (password.length < 6) {

            return res.status(400).json({

                message:
                    "Password must be at least 6 characters."

            });

        }


        const cleanName =
            full_name.trim();

        const cleanEmail =
            email.trim().toLowerCase();


        // -----------------------------------------
        // CHECK EXISTING USER
        // -----------------------------------------

        const userCheck =
            await pool.query(
                `
                SELECT
                    user_id,
                    full_name,
                    email,
                    email_verified
                FROM users
                WHERE LOWER(email) = LOWER($1)
                LIMIT 1
                `,
                [cleanEmail]
            );


        // -----------------------------------------
        // EXISTING USER
        // -----------------------------------------

        if (
            userCheck.rows.length > 0
        ) {

            const existingUser =
                userCheck.rows[0];


            // Already verified
            if (
                existingUser.email_verified
            ) {

                return res.status(400).json({

                    message:
                        "Email is already registered. Please login."

                });

            }


            // Existing but not verified
            // Send a new OTP
            const otp =
                generateOTP();

            const otpHash =
                hashOTP(otp);

            const otpExpiry =
                getOTPExpiry();


            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            await pool.query(
                `
                UPDATE users
                SET
                    full_name = $1,
                    password = $2,
                    verification_otp_hash = $3,
                    verification_otp_expires_at = $4,
                    email_verified = FALSE
                WHERE user_id = $5
                `,
                [
                    cleanName,
                    hashedPassword,
                    otpHash,
                    otpExpiry,
                    existingUser.user_id
                ]
            );


            await sendOTPEmail({
                email: cleanEmail,
                fullName: cleanName,
                otp,
                type: "registration"
            });


            return res.status(200).json({

                message:
                    "OTP sent to your email. Please verify your email.",

                requiresVerification: true,

                email: cleanEmail

            });

        }


        // -----------------------------------------
        // HASH PASSWORD
        // -----------------------------------------

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // -----------------------------------------
        // GENERATE OTP
        // -----------------------------------------

        const otp =
            generateOTP();

        const otpHash =
            hashOTP(otp);

        const otpExpiry =
            getOTPExpiry();


        // -----------------------------------------
        // CREATE PATIENT
        // -----------------------------------------

        const newUser =
            await pool.query(
                `
                INSERT INTO users
                (
                    full_name,
                    email,
                    password,
                    role,
                    email_verified,
                    verification_otp_hash,
                    verification_otp_expires_at
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    FALSE,
                    $5,
                    $6
                )
                RETURNING
                    user_id,
                    full_name,
                    email,
                    role,
                    email_verified
                `,
                [
                    cleanName,
                    cleanEmail,
                    hashedPassword,
                    "patient",
                    otpHash,
                    otpExpiry
                ]
            );


        // -----------------------------------------
        // SEND OTP
        // -----------------------------------------
try {
    console.log("📧 Attempting to send OTP email...");
    console.log("📧 SMTP USER:", process.env.SMTP_USER);
    console.log("📧 SMTP HOST:", process.env.SMTP_HOST);
    console.log("📧 SMTP PORT:", process.env.SMTP_PORT);

    await sendOTPEmail({
        email: cleanEmail,
        fullName: cleanName,
        otp,
        type: "registration"
    });

    console.log("✅ OTP email sent successfully!");

} catch (emailError) {

    console.error("❌ OTP EMAIL ERROR");
    console.error("Message:", emailError.message);
    console.error("Code:", emailError.code);
    console.error("Command:", emailError.command);
    console.error("Response:", emailError.response);
    console.error("Full error:", emailError);

    await pool.query(
        `
        DELETE FROM users
        WHERE user_id = $1
        `,
        [
            newUser.rows[0].user_id
        ]
    );

    return res.status(500).json({
        message:
            "Unable to send verification email. Please try again."
    });
}


        // -----------------------------------------
        // RESPONSE
        // -----------------------------------------

        return res.status(201).json({

            message:
                "Registration started. OTP sent to your email.",

            requiresVerification:
                true,

            email:
                cleanEmail

        });


    } catch (err) {

        console.error(
            "Register Error:",
            err
        );


        return res.status(500).json({

            message:
                "Server error during registration."

        });

    }

};


// =========================================================
// VERIFY REGISTRATION EMAIL
// =========================================================

export const verifyEmail = async (req, res) => {

    try {

        const {
            email,
            otp
        } = req.body;


        if (!email || !otp) {

            return res.status(400).json({

                message:
                    "Email and OTP are required."

            });

        }


        const cleanEmail =
            email.trim().toLowerCase();

        const cleanOTP =
            otp.trim();


        // -----------------------------------------
        // FIND USER
        // -----------------------------------------

        const result =
            await pool.query(
                `
                SELECT
                    user_id,
                    full_name,
                    email,
                    role,
                    email_verified,
                    verification_otp_hash,
                    verification_otp_expires_at
                FROM users
                WHERE LOWER(email) = LOWER($1)
                LIMIT 1
                `,
                [cleanEmail]
            );


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({

                message:
                    "User not found."

            });

        }


        const user =
            result.rows[0];


        // Already verified
        if (
            user.email_verified
        ) {

            return res.status(200).json({

                message:
                    "Email is already verified."

            });

        }


        // -----------------------------------------
        // CHECK OTP
        // -----------------------------------------

        const otpHash =
            hashOTP(cleanOTP);


        if (
            otpHash !==
            user.verification_otp_hash
        ) {

            return res.status(400).json({

                message:
                    "Invalid OTP."

            });

        }


        // -----------------------------------------
        // CHECK EXPIRY
        // -----------------------------------------

        if (
            !user.verification_otp_expires_at ||
            new Date(
                user.verification_otp_expires_at
            ) < new Date()
        ) {

            return res.status(400).json({

                message:
                    "OTP has expired. Please request a new OTP."

            });

        }


        // -----------------------------------------
        // VERIFY USER
        // -----------------------------------------

        const updatedUser =
            await pool.query(
                `
                UPDATE users
                SET
                    email_verified = TRUE,
                    verification_otp_hash = NULL,
                    verification_otp_expires_at = NULL
                WHERE user_id = $1
                RETURNING
                    user_id,
                    full_name,
                    email,
                    phone,
                    role,
                    email_verified
                `,
                [
                    user.user_id
                ]
            );


        return res.status(200).json({

            message:
                "Email verified successfully.",

            user:
                updatedUser.rows[0]

        });


    } catch (err) {

        console.error(
            "Verify Email Error:",
            err
        );


        return res.status(500).json({

            message:
                "Server error during email verification."

        });

    }

};


// =========================================================
// RESEND REGISTRATION OTP
// =========================================================

export const resendVerificationOTP = async (
    req,
    res
) => {

    try {

        const {
            email
        } = req.body;


        if (!email) {

            return res.status(400).json({

                message:
                    "Email is required."

            });

        }


        const cleanEmail =
            email.trim().toLowerCase();


        const result =
            await pool.query(
                `
                SELECT
                    user_id,
                    full_name,
                    email,
                    email_verified
                FROM users
                WHERE LOWER(email) = LOWER($1)
                LIMIT 1
                `,
                [cleanEmail]
            );


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({

                message:
                    "User not found."

            });

        }


        const user =
            result.rows[0];


        if (
            user.email_verified
        ) {

            return res.status(400).json({

                message:
                    "Email is already verified."

            });

        }


        const otp =
            generateOTP();

        const otpHash =
            hashOTP(otp);

        const otpExpiry =
            getOTPExpiry();


        await pool.query(
            `
            UPDATE users
            SET
                verification_otp_hash = $1,
                verification_otp_expires_at = $2
            WHERE user_id = $3
            `,
            [
                otpHash,
                otpExpiry,
                user.user_id
            ]
        );


        await sendOTPEmail({

            email: user.email,

            fullName: user.full_name,

            otp,

            type: "registration"

        });


        return res.status(200).json({

            message:
                "A new OTP has been sent to your email."

        });


    } catch (err) {

        console.error(
            "Resend OTP Error:",
            err
        );


        return res.status(500).json({

            message:
                "Unable to resend OTP."

        });

    }

};

// =========================================================
// SEND DOCTOR LOGIN VERIFICATION EMAIL
// =========================================================

const sendDoctorLoginVerificationEmail = async ({
    email,
    fullName,
    otp
}) => {

    await transporter.sendMail({

        from:
            process.env.SMTP_FROM ||
            process.env.SMTP_USER,

        to:
            email,

        subject:
            "MediFind - Doctor Login Verification",

        text:
            `Hello Dr. ${fullName},\n\n` +
            `A login attempt was made for your MediFind doctor account.\n\n` +
            `Your verification OTP is: ${otp}\n\n` +
            `This OTP will expire in 10 minutes.\n\n` +
            `If this was not you, please contact the administrator.\n\n` +
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
                ">
                    MediFind Doctor Login Verification
                </h2>

                <p>
                    Hello Dr. ${fullName},
                </p>

                <p>
                    A login attempt was made for your
                    MediFind doctor account.
                </p>

                <p>
                    Please enter the following OTP
                    to verify your doctor account.
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
                        Doctor Verification OTP
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
                    If this login attempt was not made by you,
                    please contact the administrator.
                </p>

                <p>
                    Regards,<br>
                    <strong>MediFind</strong>
                </p>

            </div>
        `
    });
};

// =========================================================
// LOGIN USER
// =========================================================

// =========================================================
// LOGIN USER / DOCTOR / ADMIN
// =========================================================

export const loginUser = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        // -----------------------------------------
        // CHECK INPUT
        // -----------------------------------------

        if (!email || !password) {
            return res.status(400).json({
                message:
                    "Email and password are required."
            });
        }

        const cleanEmail =
            email.trim().toLowerCase();

        // -----------------------------------------
        // FIND USER
        // -----------------------------------------

        const result =
            await pool.query(
                `
                SELECT
                    user_id,
                    full_name,
                    email,
                    password,
                    phone,
                    role,
                    email_verified
                FROM users
                WHERE LOWER(email) = LOWER($1)
                LIMIT 1
                `,
                [cleanEmail]
            );

        // -----------------------------------------
        // USER NOT FOUND
        // -----------------------------------------

        if (result.rows.length === 0) {
            return res.status(401).json({
                message:
                    "Invalid email or password."
            });
        }

        const user =
            result.rows[0];

        // -----------------------------------------
        // CHECK PASSWORD
        // -----------------------------------------

        const validPassword =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!validPassword) {
            return res.status(401).json({
                message:
                    "Invalid email or password."
            });
        }

        // =====================================================
        // DOCTOR LOGIN
        // =====================================================

        if (user.role === "doctor") {

            // -----------------------------------------
            // FIND DOCTOR PROFILE
            // -----------------------------------------

            const doctorResult =
                await pool.query(
                    `
                    SELECT
                        doctor_id,
                        user_id,
                        full_name,
                        email,
                        email_verified
                    FROM doctors
                    WHERE user_id = $1
                       OR LOWER(email) = LOWER($2)
                    LIMIT 1
                    `,
                    [
                        user.user_id,
                        cleanEmail
                    ]
                );

            // -----------------------------------------
            // DOCTOR PROFILE NOT FOUND
            // -----------------------------------------

            if (doctorResult.rows.length === 0) {

                return res.status(403).json({
                    message:
                        "Your doctor account is not properly linked. Please contact the administrator.",
                    doctorAccountError:
                        true
                });
            }

            const doctor =
                doctorResult.rows[0];

            // -----------------------------------------
            // DOCTOR EMAIL NOT VERIFIED
            // -----------------------------------------

            if (doctor.email_verified !== true) {

                const otp =
                    generateOTP();

                const otpHash =
                    hashOTP(otp);

                const otpExpiry =
                    getOTPExpiry();

                // Save doctor OTP
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
                        otpHash,
                        otpExpiry,
                        doctor.doctor_id
                    ]
                );

                // Send OTP
                try {

                    await sendDoctorLoginVerificationEmail({
                        email: doctor.email,
                        fullName: doctor.full_name,
                        otp
                    });

                } catch (emailError) {

                    console.error(
                        "Doctor login OTP email error:",
                        emailError
                    );

                    return res.status(500).json({
                        message:
                            "Unable to send doctor verification OTP."
                    });
                }

                return res.status(403).json({
                    message:
                        "Doctor email verification is required before login.",
                    requiresVerification:
                        true,
                    doctorVerification:
                        true,
                    email:
                        doctor.email
                });
            }
        }

        // =====================================================
        // NORMAL USER EMAIL VERIFICATION
        // =====================================================

        if (
            user.role !== "doctor" &&
            user.email_verified === false
        ) {

            return res.status(403).json({
                message:
                    "Please verify your email before logging in.",
                requiresVerification:
                    true,
                email:
                    user.email
            });
        }

        // =====================================================
        // CREATE JWT
        // =====================================================

        const token =
            jwt.sign(
                {
                    user_id:
                        user.user_id,

                    email:
                        user.email,

                    role:
                        user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        "24h"
                }
            );

        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(200).json({

            message:
                "Login successful.",

            token,

            user: {
                user_id:
                    user.user_id,

                full_name:
                    user.full_name,

                email:
                    user.email,

                phone:
                    user.phone,

                role:
                    user.role,

                email_verified:
                    user.email_verified
            }
        });

    } catch (err) {

        console.error(
            "Login Error:",
            err
        );

        return res.status(500).json({
            message:
                "Server error during login."
        });
    }
};


// =========================================================
// FORGOT PASSWORD - SEND OTP
// =========================================================

export const forgotPassword = async (
    req,
    res
) => {

    try {

        const {
            email
        } = req.body;


        if (!email) {

            return res.status(400).json({

                message:
                    "Email is required."

            });

        }


        const cleanEmail =
            email.trim().toLowerCase();


        const result =
            await pool.query(
                `
                SELECT
                    user_id,
                    full_name,
                    email,
                    email_verified
                FROM users
                WHERE LOWER(email) = LOWER($1)
                LIMIT 1
                `,
                [cleanEmail]
            );


        /*
         * We intentionally return the same message
         * whether the email exists or not.
         */

        if (
            result.rows.length === 0
        ) {

            return res.status(200).json({

                message:
                    "If an account exists with this email, an OTP has been sent."

            });

        }


        const user =
            result.rows[0];


        if (
            user.email_verified === false
        ) {

            return res.status(400).json({

                message:
                    "Please verify your email before resetting your password."

            });

        }


        // -----------------------------------------
        // GENERATE RESET OTP
        // -----------------------------------------

        const otp =
            generateOTP();

        const otpHash =
            hashOTP(otp);

        const otpExpiry =
            getOTPExpiry();


        await pool.query(
            `
            UPDATE users
            SET
                reset_otp_hash = $1,
                reset_otp_expires_at = $2
            WHERE user_id = $3
            `,
            [
                otpHash,
                otpExpiry,
                user.user_id
            ]
        );


        // -----------------------------------------
        // SEND OTP
        // -----------------------------------------

        await sendOTPEmail({

            email:
                user.email,

            fullName:
                user.full_name,

            otp,

            type:
                "password"

        });


        return res.status(200).json({

            message:
                "If an account exists with this email, an OTP has been sent."

        });


    } catch (err) {

        console.error(
            "Forgot Password Error:",
            err
        );


        return res.status(500).json({

            message:
                "Unable to process password reset request."

        });

    }

};


// =========================================================
// VERIFY PASSWORD RESET OTP
// =========================================================

export const verifyResetOTP = async (
    req,
    res
) => {

    try {

        const {
            email,
            otp
        } = req.body;


        if (!email || !otp) {

            return res.status(400).json({

                message:
                    "Email and OTP are required."

            });

        }


        const cleanEmail =
            email.trim().toLowerCase();


        const otpHash =
            hashOTP(
                otp.trim()
            );


        const result =
            await pool.query(
                `
                SELECT
                    user_id,
                    email,
                    reset_otp_hash,
                    reset_otp_expires_at
                FROM users
                WHERE LOWER(email) = LOWER($1)
                LIMIT 1
                `,
                [cleanEmail]
            );


        if (
            result.rows.length === 0
        ) {

            return res.status(400).json({

                message:
                    "Invalid email or OTP."

            });

        }


        const user =
            result.rows[0];


        // -----------------------------------------
        // CHECK OTP
        // -----------------------------------------

        if (
            otpHash !==
            user.reset_otp_hash
        ) {

            return res.status(400).json({

                message:
                    "Invalid OTP."

            });

        }


        // -----------------------------------------
        // CHECK EXPIRY
        // -----------------------------------------

        if (
            !user.reset_otp_expires_at ||
            new Date(
                user.reset_otp_expires_at
            ) < new Date()
        ) {

            return res.status(400).json({

                message:
                    "OTP has expired. Please request a new OTP."

            });

        }


        /*
         * Create a short-lived token.
         *
         * This token proves that the user
         * successfully verified the reset OTP.
         */

        const resetToken =
            jwt.sign(

                {
                    user_id:
                        user.user_id,

                    purpose:
                        "password-reset"

                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        "10m"
                }

            );


        // OTP cannot be reused
        await pool.query(
            `
            UPDATE users
            SET
                reset_otp_hash = NULL,
                reset_otp_expires_at = NULL
            WHERE user_id = $1
            `,
            [
                user.user_id
            ]
        );


        return res.status(200).json({

            message:
                "OTP verified successfully.",

            resetToken

        });


    } catch (err) {

        console.error(
            "Verify Reset OTP Error:",
            err
        );


        return res.status(500).json({

            message:
                "Unable to verify reset OTP."

        });

    }

};


// =========================================================
// RESET PASSWORD
// =========================================================

export const resetPassword = async (req, res) => {

    try {

        const {
            resetToken,
            password
        } = req.body;


        // -----------------------------------------
        // CHECK INPUT
        // -----------------------------------------

        if (!resetToken || !password) {

            return res.status(400).json({

                message:
                    "Reset token and new password are required."

            });

        }


        // -----------------------------------------
        // CHECK PASSWORD LENGTH
        // -----------------------------------------

        if (password.length < 6) {

            return res.status(400).json({

                message:
                    "Password must be at least 6 characters."

            });

        }


        // -----------------------------------------
        // VERIFY RESET TOKEN
        // -----------------------------------------

        let decoded;

        try {

            decoded = jwt.verify(
                resetToken,
                process.env.JWT_SECRET
            );

        } catch (tokenError) {

            console.error(
                "Reset Token Error:",
                tokenError.message
            );

            return res.status(400).json({

                message:
                    "Password reset session has expired. Please request a new OTP."

            });

        }


        // -----------------------------------------
        // CHECK TOKEN PURPOSE
        // -----------------------------------------

        if (
            decoded.purpose !==
            "password-reset"
        ) {

            return res.status(400).json({

                message:
                    "Invalid password reset token."

            });

        }


        // -----------------------------------------
        // CHECK USER EXISTS
        // -----------------------------------------

        const userResult =
            await pool.query(
                `
                SELECT
                    user_id,
                    email,
                    full_name,
                    role
                FROM users
                WHERE user_id = $1
                LIMIT 1
                `,
                [
                    decoded.user_id
                ]
            );


        if (
            userResult.rows.length === 0
        ) {

            return res.status(404).json({

                message:
                    "User account was not found."

            });

        }


        const user =
            userResult.rows[0];


        // -----------------------------------------
        // HASH NEW PASSWORD
        // -----------------------------------------

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // -----------------------------------------
        // UPDATE PASSWORD
        // IMPORTANT:
        // Your database column is "password"
        // -----------------------------------------

        const updateResult =
            await pool.query(
                `
                UPDATE users
                SET password = $1
                WHERE user_id = $2
                RETURNING
                    user_id,
                    full_name,
                    email,
                    role
                `,
                [
                    hashedPassword,
                    user.user_id
                ]
            );


        // -----------------------------------------
        // MAKE SURE DATABASE UPDATED
        // -----------------------------------------

        if (
            updateResult.rowCount !== 1
        ) {

            console.error(
                "Password update failed."
            );

            return res.status(500).json({

                message:
                    "Password could not be updated."

            });

        }


        // -----------------------------------------
        // VERIFY THE NEW PASSWORD
        // -----------------------------------------

        const verifyResult =
            await pool.query(
                `
                SELECT password
                FROM users
                WHERE user_id = $1
                LIMIT 1
                `,
                [
                    user.user_id
                ]
            );


        if (
            verifyResult.rows.length === 0
        ) {

            return res.status(500).json({

                message:
                    "Password update could not be verified."

            });

        }


        const passwordSaved =
            await bcrypt.compare(
                password,
                verifyResult.rows[0].password
            );


        if (!passwordSaved) {

            console.error(
                "Password verification after update failed."
            );

            return res.status(500).json({

                message:
                    "Password update verification failed."

            });

        }


        // -----------------------------------------
        // SUCCESS
        // -----------------------------------------

        console.log(
            `✅ Password successfully updated for ${user.email}`
        );


        return res.status(200).json({

            message:
                "Password reset successfully. You can now login.",

            user: {

                user_id:
                    user.user_id,

                full_name:
                    user.full_name,

                email:
                    user.email,

                role:
                    user.role

            }

        });


    } catch (err) {

        console.error(
            "Reset Password Error:",
            err
        );


        return res.status(500).json({

            message:
                "Unable to reset password."

        });

    }

};


// =========================================================
// LOGOUT USER
// =========================================================

export const logoutUser = async (
    req,
    res
) => {

    try {

        return res.status(200).json({

            message:
                "Logged out successfully."

        });

    } catch (err) {

        console.error(
            "Logout Error:",
            err
        );


        return res.status(500).json({

            message:
                "Error during logout."

        });

    }

};