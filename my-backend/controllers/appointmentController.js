import pool from "../db.js";


// =========================================================
// GET ALL APPOINTMENTS
// =========================================================

export const getAppointments = async (req, res) => {

    try {

        const result = await pool.query(
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
                u.phone AS patient_phone,

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

            ORDER BY
                a.appointment_date ASC,
                a.appointment_time ASC
            `
        );


        return res.status(200).json(
            result.rows
        );


    } catch (err) {

        console.error(
            "Get appointments error:",
            err
        );


        return res.status(500).json({

            message:
                "Error fetching appointments",

            error:
                err.message

        });

    }

};


// =========================================================
// GET MY APPOINTMENTS
// Logged-in Patient
// =========================================================

export const getMyAppointments = async (
    req,
    res
) => {

    try {

        const patient_id =
            req.user.user_id;


        const result =
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

                    d.full_name
                        AS doctor_name,

                    d.specialization,

                    h.hospital_name

                FROM appointments a

                LEFT JOIN doctors d
                    ON a.doctor_id =
                       d.doctor_id

                LEFT JOIN hospitals h
                    ON d.hospital_id =
                       h.hospital_id

                WHERE a.patient_id = $1

                ORDER BY
                    a.appointment_date ASC,
                    a.appointment_time ASC
                `,
                [patient_id]
            );


        return res.status(200).json(
            result.rows
        );


    } catch (err) {

        console.error(
            "Get my appointments error:",
            err
        );


        return res.status(500).json({

            message:
                "Error fetching your appointments",

            error:
                err.message

        });

    }

};


// =========================================================
// GET DOCTOR APPOINTMENTS
// Logged-in Doctor
// =========================================================

export const getDoctorAppointments = async (
    req,
    res
) => {

    try {

        // ==========================================
        // FIND DOCTOR PROFILE
        // ==========================================

        const doctorResult =
            await pool.query(
                `
                SELECT
                    doctor_id,
                    full_name,
                    specialization,
                    hospital_id

                FROM doctors

                WHERE user_id = $1
                `,
                [req.user.user_id]
            );


        if (
            doctorResult.rows.length === 0
        ) {

            return res.status(404).json({

                message:
                    "Doctor profile not found."

            });

        }


        const doctor =
            doctorResult.rows[0];


        // ==========================================
        // GET THIS DOCTOR'S APPOINTMENTS
        // ==========================================

        const result =
            await pool.query(
                `
                SELECT

                    a.appointment_id,

                    a.patient_id,

                    a.doctor_id,

                    a.appointment_date,

                    a.appointment_time,

                    -- ⭐ PATIENT'S ACTUAL REASON
                    a.reason,

                    a.status,

                    u.full_name
                        AS patient_name,

                    u.email
                        AS patient_email,

                    u.phone
                        AS patient_phone,

                    d.full_name
                        AS doctor_name,

                    d.specialization,

                    h.hospital_name

                FROM appointments a

                LEFT JOIN users u
                    ON a.patient_id =
                       u.user_id

                LEFT JOIN doctors d
                    ON a.doctor_id =
                       d.doctor_id

                LEFT JOIN hospitals h
                    ON d.hospital_id =
                       h.hospital_id

                WHERE a.doctor_id = $1

                ORDER BY
                    a.appointment_date ASC,
                    a.appointment_time ASC
                `,
                [doctor.doctor_id]
            );


        // ==========================================
        // RETURN DATA
        // ==========================================

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
// BOOK APPOINTMENT
// Logged-in Patient
// =========================================================

export const bookAppointment = async (
    req,
    res
) => {

    try {

        // ==========================================
        // PATIENT FROM JWT
        // ==========================================

        const patient_id =
            req.user.user_id;


        // ==========================================
        // DATA FROM FRONTEND
        // ==========================================

        const {

            doctor_id,

            appointment_date,

            appointment_time,

            reason

        } = req.body;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            !doctor_id ||
            !appointment_date ||
            !appointment_time ||
            !reason ||
            !String(reason).trim()
        ) {

            return res.status(400).json({

                message:
                    "Doctor, date, time and reason are required."

            });

        }


        const cleanReason =
            String(reason).trim();


        // ==========================================
        // CHECK DOCTOR
        // ==========================================

        const doctor =
            await pool.query(
                `
                SELECT

                    doctor_id,

                    hospital_id

                FROM doctors

                WHERE doctor_id = $1
                `,
                [doctor_id]
            );


        if (
            doctor.rows.length === 0
        ) {

            return res.status(404).json({

                message:
                    "Doctor not found."

            });

        }


        // ==========================================
        // CHECK DUPLICATE APPOINTMENT
        // ==========================================

        const existingAppointment =
            await pool.query(
                `
                SELECT
                    appointment_id

                FROM appointments

                WHERE doctor_id = $1

                AND appointment_date = $2

                AND appointment_time = $3

                AND status != 'cancelled'
                `,
                [

                    doctor_id,

                    appointment_date,

                    appointment_time

                ]
            );


        if (
            existingAppointment.rows.length > 0
        ) {

            return res.status(409).json({

                message:
                    "Doctor is already booked for this time."

            });

        }


        // ==========================================
        // INSERT APPOINTMENT
        // ==========================================

        const result =
            await pool.query(
                `
                INSERT INTO appointments
                (

                    patient_id,

                    doctor_id,

                    appointment_date,

                    appointment_time,

                    reason,

                    status

                )

                VALUES
                (

                    $1,

                    $2,

                    $3,

                    $4,

                    $5,

                    $6

                )

                RETURNING *
                `,
                [

                    patient_id,

                    doctor_id,

                    appointment_date,

                    appointment_time,

                    cleanReason,

                    "pending"

                ]
            );


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(201).json({

            message:
                "Appointment booked successfully.",

            appointment:
                result.rows[0]

        });


    } catch (err) {

        console.error(
            "Book appointment error:",
            err
        );


        return res.status(500).json({

            message:
                "Error booking appointment.",

            error:
                err.message

        });

    }

};


// =========================================================
// UPDATE APPOINTMENT
// Admin / Doctor
// =========================================================

export const updateAppointment = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;


        const {
            appointment_date,
            appointment_time,
            status
        } = req.body;


        // ==========================================
        // GET APPOINTMENT
        // ==========================================

        const appointmentResult =
            await pool.query(
                `
                SELECT *

                FROM appointments

                WHERE appointment_id = $1
                `,
                [id]
            );


        if (
            appointmentResult.rows.length === 0
        ) {

            return res.status(404).json({

                message:
                    "Appointment not found."

            });

        }


        const appointment =
            appointmentResult.rows[0];


        const userRole =
            req.user.role;


        // ==========================================
        // DOCTOR
        // ==========================================

        if (
            userRole === "doctor"
        ) {

            const doctorResult =
                await pool.query(
                    `
                    SELECT
                        doctor_id

                    FROM doctors

                    WHERE user_id = $1
                    `,
                    [req.user.user_id]
                );


            if (
                doctorResult.rows.length === 0
            ) {

                return res.status(403).json({

                    message:
                        "Doctor profile not found."

                });

            }


            const doctor_id =
                doctorResult.rows[0]
                    .doctor_id;


            if (
                Number(
                    appointment.doctor_id
                ) !==
                Number(
                    doctor_id
                )
            ) {

                return res.status(403).json({

                    message:
                        "You can only update your own appointments."

                });

            }

        }

        // ==========================================
        // ONLY ADMIN OR DOCTOR
        // ==========================================

        else if (
            userRole !== "admin"
        ) {

            return res.status(403).json({

                message:
                    "You are not authorized to update appointments."

            });

        }


        // ==========================================
        // UPDATE
        // ==========================================

        const result =
            await pool.query(
                `
                UPDATE appointments

                SET

                    appointment_date =
                        COALESCE(
                            $1,
                            appointment_date
                        ),

                    appointment_time =
                        COALESCE(
                            $2,
                            appointment_time
                        ),

                    status =
                        COALESCE(
                            $3,
                            status
                        )

                WHERE appointment_id = $4

                RETURNING *
                `,
                [

                    appointment_date ||
                        null,

                    appointment_time ||
                        null,

                    status ||
                        null,

                    id

                ]
            );


        return res.status(200).json({

            message:
                "Appointment updated successfully.",

            appointment:
                result.rows[0]

        });


    } catch (err) {

        console.error(
            "Update appointment error:",
            err
        );


        return res.status(500).json({

            message:
                "Error updating appointment.",

            error:
                err.message

        });

    }

};


// =========================================================
// CANCEL APPOINTMENT
// =========================================================

export const cancelAppointment = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;


        const userId =
            req.user.user_id;


        // ==========================================
        // FIND APPOINTMENT
        // ==========================================

        const appointmentResult =
            await pool.query(
                `
                SELECT *

                FROM appointments

                WHERE appointment_id = $1
                `,
                [id]
            );


        if (
            appointmentResult.rows.length === 0
        ) {

            return res.status(404).json({

                message:
                    "Appointment not found."

            });

        }


        const appointment =
            appointmentResult.rows[0];


        // ==========================================
        // ADMIN CAN CANCEL
        // ==========================================

        if (
            req.user.role !== "admin"
        ) {

            // Patient can cancel own appointment
            if (
                req.user.role === "patient" &&
                Number(
                    appointment.patient_id
                ) !==
                Number(userId)
            ) {

                return res.status(403).json({

                    message:
                        "You can only cancel your own appointments."

                });

            }


            // Doctor can cancel own appointment
            if (
                req.user.role === "doctor"
            ) {

                const doctorResult =
                    await pool.query(
                        `
                        SELECT
                            doctor_id

                        FROM doctors

                        WHERE user_id = $1
                        `,
                        [userId]
                    );


                if (
                    doctorResult.rows.length === 0
                ) {

                    return res.status(403).json({

                        message:
                            "Doctor profile not found."

                    });

                }


                const doctor_id =
                    doctorResult.rows[0]
                        .doctor_id;


                if (
                    Number(
                        appointment.doctor_id
                    ) !==
                    Number(
                        doctor_id
                    )
                ) {

                    return res.status(403).json({

                        message:
                            "You can only cancel your own appointments."

                    });

                }

            }

        }


        // ==========================================
        // CANCEL
        // ==========================================

        const result =
            await pool.query(
                `
                UPDATE appointments

                SET status = 'cancelled'

                WHERE appointment_id = $1

                RETURNING *
                `,
                [id]
            );


        return res.status(200).json({

            message:
                "Appointment cancelled successfully.",

            appointment:
                result.rows[0]

        });


    } catch (err) {

        console.error(
            "Cancel appointment error:",
            err
        );


        return res.status(500).json({

            message:
                "Error cancelling appointment.",

            error:
                err.message

        });

    }

};