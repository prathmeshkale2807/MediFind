import pool from "../db.js";
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
// SEND CONTACT MESSAGE
// =========================================================

export const sendContactMessage = async (
    req,
    res
) => {

    try {

        const {
            name,
            email,
            message
        } = req.body;


        // =====================================================
        // VALIDATION
        // =====================================================

        if (
            !name ||
            !email ||
            !message
        ) {

            return res.status(400).json({
                message:
                    "Please fill all required fields."
            });

        }


        const cleanName =
            String(name).trim();

        const cleanEmail =
            String(email)
                .trim()
                .toLowerCase();

        const cleanMessage =
            String(message).trim();


        if (cleanName.length < 2) {

            return res.status(400).json({
                message:
                    "Please enter a valid name."
            });

        }


        if (cleanMessage.length < 5) {

            return res.status(400).json({
                message:
                    "Message must contain at least 5 characters."
            });

        }


        // =====================================================
        // EMAIL VALIDATION
        // =====================================================

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {

            return res.status(400).json({
                message:
                    "Please enter a valid email address."
            });

        }


        // =====================================================
        // SAVE MESSAGE TO DATABASE
        // =====================================================

        const result =
            await pool.query(
                `
                INSERT INTO contact_messages (
                    name,
                    email,
                    message
                )
                VALUES (
                    $1,
                    $2,
                    $3
                )
                RETURNING
                    contact_id,
                    name,
                    email,
                    message,
                    created_at
                `,
                [
                    cleanName,
                    cleanEmail,
                    cleanMessage
                ]
            );


        // =====================================================
        // SEND EMAIL TO MEDIFIND SUPPORT
        // =====================================================

        try {

            await transporter.sendMail({

                from:
                    process.env.SMTP_FROM ||
                    process.env.SMTP_USER,

                to:
                    process.env.SMTP_USER,

                replyTo:
                    cleanEmail,

                subject:
                    `MediFind Contact Message - ${cleanName}`,

                text:
                    `New message received from MediFind Contact Us form.\n\n` +
                    `Name: ${cleanName}\n` +
                    `Email: ${cleanEmail}\n\n` +
                    `Message:\n${cleanMessage}\n\n` +
                    `MediFind`,

                html: `
                    <div style="
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: 30px auto;
                        padding: 30px;
                        border: 1px solid #e5e7eb;
                        border-radius: 14px;
                    ">

                        <h2 style="
                            color: #2563eb;
                            margin-bottom: 20px;
                        ">
                            New MediFind Contact Message
                        </h2>

                        <p>
                            <strong>Name:</strong>
                            ${cleanName}
                        </p>

                        <p>
                            <strong>Email:</strong>
                            ${cleanEmail}
                        </p>

                        <div style="
                            margin-top: 20px;
                            padding: 18px;
                            background: #f8fafc;
                            border-radius: 10px;
                        ">

                            <strong>Message:</strong>

                            <p style="
                                white-space: pre-wrap;
                                color: #475569;
                            ">
                                ${cleanMessage}
                            </p>

                        </div>

                        <p style="
                            margin-top: 25px;
                            color: #64748b;
                        ">
                            Sent from the MediFind Contact Us page.
                        </p>

                    </div>
                `
            });

        } catch (emailError) {

            console.error(
                "Contact email error:",
                emailError
            );

            // Message is already safely stored
            // in PostgreSQL, so don't fail the request.

        }


        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(201).json({

            message:
                "Your message has been sent successfully.",

            contact:
                result.rows[0]

        });


    } catch (err) {

        console.error(
            "Contact message error:",
            err
        );


        return res.status(500).json({

            message:
                "Unable to send your message right now.",

            error:
                err.message

        });

    }

};