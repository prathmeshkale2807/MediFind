import pool from "../db.js";


// =========================================================
// BOOK APPOINTMENT
// Logged-in Patient
// =========================================================

export const bookPublicAppointment = async (req, res) => {

    const client = await pool.connect();

    try {

        // =====================================================
        // USER FROM JWT
        // =====================================================

        if (!req.user) {

            return res.status(401).json({
                message:
                    "You must be logged in to book an appointment."
            });

        }


        const patientId =
            req.user.user_id;


        // =====================================================
        // ONLY PATIENTS CAN BOOK
        // =====================================================

        if (req.user.role !== "patient") {

            return res.status(403).json({
                message:
                    "Only patient accounts can book appointments."
            });

        }


        // =====================================================
        // FRONTEND DATA
        // =====================================================

        const {
            name,
            age,
            gender,
            phone,
            email,
            hospitalId,
            doctorId,
            date,
            time,
            problem
        } = req.body;


        // =====================================================
        // REQUIRED FIELDS
        // =====================================================

        if (
            !doctorId ||
            !date ||
            !time
        ) {

            return res.status(400).json({

                message:
                    "Doctor, date and time are required."

            });

        }


        await client.query("BEGIN");


        // =====================================================
        // GET LOGGED-IN PATIENT
        // =====================================================

        const patientResult =
            await client.query(
                `
                SELECT
                    user_id,
                    full_name,
                    email,
                    phone,
                    role
                FROM users
                WHERE user_id = $1
                LIMIT 1
                `,
                [patientId]
            );


        if (
            patientResult.rows.length === 0
        ) {

            await client.query("ROLLBACK");

            return res.status(404).json({

                message:
                    "Patient account not found."

            });

        }


        const patient =
            patientResult.rows[0];


        // =====================================================
        // CHECK PATIENT ROLE
        // =====================================================

        if (
            patient.role !== "patient"
        ) {

            await client.query("ROLLBACK");

            return res.status(403).json({

                message:
                    "Only patients can book appointments."

            });

        }


        // =====================================================
        // GET DOCTOR
        // =====================================================

        const doctorResult =
            await client.query(
                `
                SELECT
                    d.doctor_id,
                    d.full_name AS doctor_name,
                    d.hospital_id,
                    h.hospital_name
                FROM doctors d
                LEFT JOIN hospitals h
                    ON h.hospital_id = d.hospital_id
                WHERE d.doctor_id = $1
                LIMIT 1
                `,
                [doctorId]
            );


        if (
            doctorResult.rows.length === 0
        ) {

            await client.query("ROLLBACK");

            return res.status(404).json({

                message:
                    "Doctor not found."

            });

        }


        const doctor =
            doctorResult.rows[0];


        // =====================================================
        // CHECK HOSPITAL
        // =====================================================

        if (
            hospitalId &&
            Number(hospitalId) !==
            Number(doctor.hospital_id)
        ) {

            await client.query("ROLLBACK");

            return res.status(400).json({

                message:
                    "Selected doctor does not belong to the selected hospital."

            });

        }


        // =====================================================
        // CHECK DOCTOR AVAILABILITY
        // =====================================================
        const dateObj = new Date(`${date}T00:00:00`);
        const dayOfWeek = dateObj.getDay();
        let scheduleResult;
        try { scheduleResult = await client.query(`SELECT start_time,end_time,slot_minutes FROM doctor_availability WHERE doctor_id=$1 AND day_of_week=$2 AND is_active=TRUE ORDER BY start_time`, [doctorId, dayOfWeek]); } catch { scheduleResult = { rows: [] }; }
        const schedules = scheduleResult.rows.length ? scheduleResult.rows : [{start_time:'09:00:00',end_time:'17:00:00',slot_minutes:60}];
        const toMinutes = value => { const [h,m]=String(value).slice(0,5).split(':').map(Number); return h*60+m; };
        const requestedMinutes=toMinutes(time);
        const slotAllowed=schedules.some(x=>requestedMinutes>=toMinutes(x.start_time)&&requestedMinutes<toMinutes(x.end_time)&&((requestedMinutes-toMinutes(x.start_time))%(Number(x.slot_minutes)||60)===0));
        if(!slotAllowed){await client.query("ROLLBACK");return res.status(400).json({message:"This time is outside the doctor's available slots."});}

        // =====================================================
        // CHECK DUPLICATE APPOINTMENT
        // =====================================================

        const existingAppointment =
            await client.query(
                `
                SELECT
                    appointment_id
                FROM appointments
                WHERE doctor_id = $1
                AND appointment_date = $2
                AND appointment_time = $3
                AND status != 'cancelled'
                LIMIT 1
                `,
                [
                    doctorId,
                    date,
                    time
                ]
            );


        if (
            existingAppointment.rows.length > 0
        ) {

            await client.query("ROLLBACK");

            return res.status(409).json({

                message:
                    "Doctor is already booked for this time."

            });

        }


        // =====================================================
        // UPDATE PATIENT INFORMATION
        // =====================================================
        //
        // We use the logged-in user's account.
        // We NEVER create a new account here.
        //
        // Email from the frontend is ignored for identity.
        // =====================================================

        if (
            name?.trim() ||
            phone?.trim()
        ) {

            await client.query(
                `
                UPDATE users
                SET
                    full_name =
                        COALESCE(
                            NULLIF($1, ''),
                            full_name
                        ),

                    phone =
                        COALESCE(
                            NULLIF($2, ''),
                            phone
                        )

                WHERE user_id = $3
                `,
                [
                    name?.trim() || "",
                    phone?.trim() || "",
                    patientId
                ]
            );

        }


        // =====================================================
        // CREATE REASON
        // =====================================================

        const reasonParts = [];


        if (
            problem &&
            String(problem).trim()
        ) {

            reasonParts.push(
                String(problem).trim()
            );

        }


        if (
            age !== undefined &&
            age !== null &&
            age !== ""
        ) {

            reasonParts.push(
                `Age: ${age}`
            );

        }


        if (gender) {

            reasonParts.push(
                `Gender: ${gender}`
            );

        }


        const reason =
            reasonParts.join(" | ") ||
            "Appointment booked from MediFind website";


        // =====================================================
        // INSERT APPOINTMENT
        // =====================================================

        const appointment =
            await client.query(
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
                    'pending'
                )
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
                    patientId,
                    doctor.doctor_id,
                    date,
                    time,
                    reason
                ]
            );


        // =====================================================
        // BOOKING NOTIFICATION
        // =====================================================
        try {
            await client.query(`INSERT INTO notifications (user_id, appointment_id, type, title, message) VALUES ($1,$2,$3,$4,$5)`, [patientId, appointment.rows[0].appointment_id, 'appointment_booked', 'Appointment Booked', `Your appointment with ${doctor.doctor_name} is booked for ${date} at ${time}.`]);
        } catch (notificationError) {
            console.warn('Booking notification skipped:', notificationError.message);
        }

        // =====================================================
        // COMMIT
        // =====================================================

        await client.query("COMMIT");


        // =====================================================
        // SUCCESS
        // =====================================================

        return res.status(201).json({

            message:
                "Appointment booked successfully.",

            appointment: {

                ...appointment.rows[0],

                patientName:
                    name?.trim() ||
                    patient.full_name,

                patientEmail:
                    patient.email,

                patientPhone:
                    phone?.trim() ||
                    patient.phone,

                doctorName:
                    doctor.doctor_name,

                hospitalName:
                    doctor.hospital_name,

                date,

                time

            }

        });


    } catch (err) {

        await client.query("ROLLBACK");

        console.error(
            "Appointment booking error:",
            err
        );


        return res.status(500).json({

            message:
                "Error booking appointment.",

            error:
                err.message

        });

    } finally {

        client.release();

    }

};