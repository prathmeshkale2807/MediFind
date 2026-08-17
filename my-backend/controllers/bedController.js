import pool from "../db.js";

// ==========================================
// GET ALL BEDS
// ==========================================

export const getBeds = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                b.bed_id,
                b.hospital_id,
                h.hospital_name,
                b.bed_type,
                b.total_beds,
                b.available_beds,
                b.updated_at,
                h.city,
                h.contact_number,
                h.latitude,
                h.longitude
            FROM beds b
            LEFT JOIN hospitals h
                ON b.hospital_id = h.hospital_id
            ORDER BY b.bed_id ASC
        `);

        res.status(200).json(result.rows);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Error fetching beds",
            error: err.message
        });
    }
};


// ==========================================
// ADD BED
// ==========================================

export const addBed = async (req, res) => {
    try {
        const {
            hospital_id,
            bed_type,
            total_beds,
            available_beds
        } = req.body;

        // Check required fields
        if (
            !hospital_id ||
            !bed_type ||
            total_beds === undefined ||
            available_beds === undefined
        ) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        // Check bed values
        if (total_beds < 0 || available_beds < 0) {
            return res.status(400).json({
                message: "Bed values cannot be negative"
            });
        }

        if (available_beds > total_beds) {
            return res.status(400).json({
                message: "Available beds cannot be greater than total beds"
            });
        }

        // Check hospital exists
        const hospital = await pool.query(
            "SELECT hospital_id FROM hospitals WHERE hospital_id = $1",
            [hospital_id]
        );

        if (hospital.rows.length === 0) {
            return res.status(404).json({
                message: "Hospital not found"
            });
        }

        // Insert bed record
        const result = await pool.query(
            `INSERT INTO beds
            (
                hospital_id,
                bed_type,
                total_beds,
                available_beds,
                updated_at
            )
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            RETURNING *`,
            [
                hospital_id,
                bed_type,
                total_beds,
                available_beds
            ]
        );

        res.status(201).json({
            message: "Bed record added successfully",
            bed: result.rows[0]
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Error adding bed record",
            error: err.message
        });
    }
};


// ==========================================
// UPDATE BED
// ==========================================

export const updateBed = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            hospital_id,
            bed_type,
            total_beds,
            available_beds
        } = req.body;

        // Check required fields
        if (
            !hospital_id ||
            !bed_type ||
            total_beds === undefined ||
            available_beds === undefined
        ) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        // Validate bed values
        if (total_beds < 0 || available_beds < 0) {
            return res.status(400).json({
                message: "Bed values cannot be negative"
            });
        }

        if (available_beds > total_beds) {
            return res.status(400).json({
                message: "Available beds cannot be greater than total beds"
            });
        }

        // Check hospital exists
        const hospital = await pool.query(
            "SELECT hospital_id FROM hospitals WHERE hospital_id = $1",
            [hospital_id]
        );

        if (hospital.rows.length === 0) {
            return res.status(404).json({
                message: "Hospital not found"
            });
        }

        // Update bed
        const result = await pool.query(
            `UPDATE beds
             SET hospital_id = $1,
                 bed_type = $2,
                 total_beds = $3,
                 available_beds = $4,
                 updated_at = CURRENT_TIMESTAMP
             WHERE bed_id = $5
             RETURNING *`,
            [
                hospital_id,
                bed_type,
                total_beds,
                available_beds,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Bed record not found"
            });
        }

        res.status(200).json({
            message: "Bed record updated successfully",
            bed: result.rows[0]
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Error updating bed record",
            error: err.message
        });
    }
};


// ==========================================
// DELETE BED
// ==========================================

export const deleteBed = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM beds
             WHERE bed_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Bed record not found"
            });
        }

        res.status(200).json({
            message: "Bed record deleted successfully",
            bed: result.rows[0]
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Error deleting bed record",
            error: err.message
        });
    }
};