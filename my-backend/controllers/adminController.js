import pool from "../db.js";

// =========================================================
// HELPER: TRANSFORM DATABASE ROW TO FRONTEND DOCTOR OBJECT
// =========================================================
const defaultPhotos = [
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop",
];

function toFrontendDoctor(row, index = 0) {
  if (!row) return null;
  return {
    ...row,
    id: row.doctor_id ?? row.id,
    doctorId: row.doctor_id ?? row.id,
    name: row.full_name ?? row.name ?? 'Doctor',
    fullName: row.full_name ?? row.name ?? 'Doctor',
    photo: row.photo || defaultPhotos[index % defaultPhotos.length],
    hospitalId: row.hospital_id ?? row.hospitalId,
    hospitalName: row.hospital_name ?? row.hospitalName ?? 'Hospital',
    qualification: row.qualification || 'MBBS',
    experience: row.experience ? (String(row.experience).includes('year') ? row.experience : `${row.experience} years`) : '5+ years',
    availability: row.availability || 'Mon - Sat (9:00 AM - 5:00 PM)',
    fee: row.fee ?? 500,
  };
}

// =========================================================
// ADMIN DASHBOARD
// =========================================================
export const getAdminDashboard = async (req, res) => {
  try {
    const users = await pool.query(`
      SELECT COUNT(*)::int AS count FROM users
    `);

    const doctors = await pool.query(`
      SELECT COUNT(*)::int AS count FROM doctors
    `);

    const hospitals = await pool.query(`
      SELECT COUNT(*)::int AS count FROM hospitals
    `);

    const beds = await pool.query(`
      SELECT COALESCE(SUM(available_beds), 0)::int AS count FROM beds
    `);

    const appointments = await pool.query(`
      SELECT COUNT(*)::int AS count FROM appointments
    `);

    const pending = await pool.query(`
      SELECT COUNT(*)::int AS count FROM appointments WHERE status = 'pending'
    `);

    res.status(200).json({
      users: users.rows[0].count,
      doctors: doctors.rows[0].count,
      hospitals: hospitals.rows[0].count,
      available_beds: beds.rows[0].count,
      appointments: appointments.rows[0].count,
      pending_appointments: pending.rows[0].count,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).json({
      message: "Error loading admin dashboard",
      error: err.message,
    });
  }
};

// =========================================================
// GET ALL USERS
// =========================================================
export const getUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT user_id, full_name, email, role
      FROM users
      ORDER BY user_id DESC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching users",
      error: err.message,
    });
  }
};

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

    // Format each row for frontend compatibility safely
    const doctors = result.rows.map((row, index) => toFrontendDoctor(row, index));

    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Server error fetching doctors", error: error.message });
  }
};

// =========================================================
// GET ALL HOSPITALS
// =========================================================
export const getHospitals = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM hospitals ORDER BY hospital_id DESC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching hospitals",
      error: err.message,
    });
  }
};

// =========================================================
// GET ALL BEDS
// =========================================================
export const getBeds = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, h.hospital_name
      FROM beds b
      LEFT JOIN hospitals h ON b.hospital_id = h.hospital_id
      ORDER BY b.bed_id DESC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching beds",
      error: err.message,
    });
  }
};

// =========================================================
// GET ALL APPOINTMENTS
// =========================================================
export const getAppointments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.appointment_id,
        a.patient_id,
        u.full_name AS patient_name,
        u.email AS patient_email,
        a.doctor_id,
        d.full_name AS doctor_name,
        d.specialization,
        h.hospital_name,
        a.appointment_date,
        a.appointment_time,
        a.status
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.user_id
      LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
      LEFT JOIN hospitals h ON d.hospital_id = h.hospital_id
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching appointments",
      error: err.message,
    });
  }
};

// =========================================================
// UPDATE APPOINTMENT STATUS
// =========================================================
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "rejected",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid appointment status",
      });
    }

    const result = await pool.query(
      `
      UPDATE appointments
      SET status = $1
      WHERE appointment_id = $2
      RETURNING *
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      message: "Appointment status updated successfully",
      appointment: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error updating appointment status",
      error: err.message,
    });
  }
};