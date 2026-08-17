import pool from "../db.js";

// SmartMatch uses the existing doctors, hospitals and appointments tables.
// Today is represented by hourly slots from 09:00 to 17:00.
const TODAY_SLOTS = [
    "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00"
];

function calculateDistance(lat1, lon1, lat2, lon2) {
    if (
        lat1 === null || lat1 === undefined ||
        lon1 === null || lon1 === undefined ||
        lat2 === null || lat2 === undefined ||
        lon2 === null || lon2 === undefined
    ) {
        return null;
    }

    const R = 6371;
    const dLat = (Number(lat2) - Number(lat1)) * Math.PI / 180;
    const dLon = (Number(lon2) - Number(lon1)) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(Number(lat1) * Math.PI / 180) *
        Math.cos(Number(lat2) * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );

    return R * c;
}

function budgetInfo(fee, min, max, hasMin, hasMax) {
    const value = Number(fee || 0);

    if (!hasMin && !hasMax) {
        return {
            score: 25,
            exact: true,
            reason: "Budget not restricted"
        };
    }

    // ₹1200+ / minimum-only budget.
    if (hasMin && !hasMax) {
        if (value >= min) {
            return {
                score: 25,
                exact: true,
                reason: "Within your budget"
            };
        }

        const closeness = Math.max(
            0,
            Math.min(1, value / Math.max(min, 1))
        );

        return {
            score: Math.round(closeness * 20),
            exact: false,
            reason: "Closest to your budget"
        };
    }

    // Range budget.
    if (value >= min && value <= max) {
        return {
            score: 25,
            exact: true,
            reason: "Within your budget"
        };
    }

    const distance = value < min
        ? min - value
        : value - max;

    const range = Math.max(max - min, 1);
    const score = Math.max(
        0,
        Math.round(25 - (distance / range) * 25)
    );

    return {
        score,
        exact: false,
        reason: value < min
            ? "Below your selected budget"
            : "Slightly above your budget"
    };
}

export const smartMatchDoctors = async (req, res) => {
    try {
        const {
            specialization = "",
            budgetMin = "",
            budgetMax = "",
            hospitalId = "",
            availability = "today"
        } = req.query;

        const min = Number(budgetMin);
        const max = Number(budgetMax);

        const hasMin = budgetMin !== "" && Number.isFinite(min);
        const hasMax = budgetMax !== "" && Number.isFinite(max);
        const hasBudget = hasMin || hasMax;

        const requestedSpecialization =
            String(specialization).trim().toLowerCase();

        const requestedHospital = hospitalId !== ""
            ? Number(hospitalId)
            : null;

        console.log("SMARTMATCH FILTERS:", {
            specialization,
            minFee: budgetMin || undefined,
            maxFee: budgetMax || undefined,
            hospitalId: hospitalId || undefined,
            availability
        });

        // ---------------------------------------------------------
        // SELECTED HOSPITAL LOCATION
        // ---------------------------------------------------------
        let selectedHospital = null;

        if (requestedHospital && Number.isFinite(requestedHospital)) {
            const hospitalResult = await pool.query(
                `
                SELECT
                    hospital_id,
                    hospital_name,
                    latitude,
                    longitude
                FROM hospitals
                WHERE hospital_id = $1
                `,
                [requestedHospital]
            );

            selectedHospital = hospitalResult.rows[0] || null;
        }

        // ---------------------------------------------------------
        // GET DOCTORS + TODAY'S BOOKINGS
        // ---------------------------------------------------------
        const result = await pool.query(
            `
            WITH booking_stats AS (
                SELECT
                    doctor_id,
                    COUNT(*) FILTER (WHERE appointment_date = CURRENT_DATE AND status NOT IN ('cancelled','rejected'))::INTEGER AS booked_today,
                    COALESCE(ARRAY_AGG(TO_CHAR(appointment_time, 'HH24:MI')) FILTER (WHERE appointment_date = CURRENT_DATE AND status NOT IN ('cancelled','rejected')), ARRAY[]::TEXT[]) AS booked_today_times
                FROM appointments
                GROUP BY doctor_id
            ),
            review_stats AS (
                SELECT doctor_id, COALESCE(AVG(rating),0) AS average_rating, COUNT(*)::INTEGER AS review_count
                FROM doctor_reviews
                GROUP BY doctor_id
            )
            SELECT
                d.doctor_id, d.full_name, d.specialization, d.phone, d.email, d.experience, d.fee, d.hospital_id,
                h.hospital_name, h.latitude, h.longitude,
                COALESCE(b.booked_today,0) AS booked_today,
                COALESCE(b.booked_today_times, ARRAY[]::TEXT[]) AS booked_today_times,
                COALESCE(r.average_rating,0) AS average_rating,
                COALESCE(r.review_count,0) AS review_count
            FROM doctors d
            LEFT JOIN hospitals h ON h.hospital_id=d.hospital_id
            LEFT JOIN booking_stats b ON b.doctor_id=d.doctor_id
            LEFT JOIN review_stats r ON r.doctor_id=d.doctor_id
            WHERE 1=1
            ${requestedSpecialization ? `AND LOWER(TRIM(d.specialization)) = LOWER(TRIM($1))` : ''}
            ORDER BY d.experience DESC, d.fee ASC
            `,
            requestedSpecialization ? [specialization.trim()] : []
        );

        const allDoctors = result.rows.map((doctor) => {
            const bookedTimes = Array.isArray(doctor.booked_today_times)
                ? doctor.booked_today_times
                : [];

            const availableTimes = TODAY_SLOTS.filter(
                (slot) => !bookedTimes.includes(slot)
            );

            const availableToday = availableTimes.length > 0;

            const budget = budgetInfo(
                doctor.fee,
                min,
                max,
                hasMin,
                hasMax
            );

            const hospitalMatch =
                !requestedHospital ||
                Number(doctor.hospital_id) === requestedHospital;

            const distanceKm = selectedHospital
                ? calculateDistance(
                    selectedHospital.latitude,
                    selectedHospital.longitude,
                    doctor.latitude,
                    doctor.longitude
                )
                : null;

            const experience = Number(doctor.experience || 0);
            const rating = Number(doctor.average_rating || 0);
            const ratingScore = Math.min(rating / 5, 1) * 10;
            const experienceScore = Math.min(
                experience / 10,
                1
            ) * 20;

            let locationScore = 0;
            let locationReason = "";

            if (!requestedHospital) {
                locationScore = 10;
                locationReason = "Any hospital accepted";
            } else if (hospitalMatch) {
                locationScore = 10;
                locationReason = "Preferred hospital matches";
            } else if (distanceKm !== null) {
                if (distanceKm <= 2) {
                    locationScore = 10;
                } else if (distanceKm <= 5) {
                    locationScore = 8;
                } else if (distanceKm <= 10) {
                    locationScore = 5;
                } else {
                    locationScore = 2;
                }

                locationReason = `${distanceKm.toFixed(1)} km from preferred hospital`;
            } else {
                locationScore = 1;
                locationReason = "Alternative hospital";
            }

            const availabilityScore =
                availability === "today"
                    ? (availableToday ? 10 : 0)
                    : 10;

            const reasons = [];

            if (requestedSpecialization) {
                reasons.push("Specialization matches");
            }

            reasons.push(budget.reason);
            reasons.push(locationReason);

            if (availableToday && availability === "today") {
                reasons.push("Available today");
            } else if (availability === "today") {
                reasons.push("Fully booked today");
            }

            if (experience > 0) {
                reasons.push(`${experience} years experience`);
            }
            if (rating > 0) {
                reasons.push(`${rating.toFixed(1)} / 5 patient rating`);
            }

            const score = Math.round(
                Math.max(
                    0,
                    Math.min(
                        100,
                        30 +
                        budget.score +
                        experienceScore +
                        ratingScore +
                        locationScore +
                        availabilityScore
                    )
                )
            );

            return {
                doctor_id: doctor.doctor_id,
                id: doctor.doctor_id,
                name: doctor.full_name,
                full_name: doctor.full_name,
                specialization: doctor.specialization,
                phone: doctor.phone,
                email: doctor.email,
                experience,
                average_rating: rating,
                review_count: Number(doctor.review_count || 0),
                fee: Number(doctor.fee || 0),
                hospital_id: doctor.hospital_id,
                hospital_name: doctor.hospital_name,
                latitude: doctor.latitude != null
                    ? Number(doctor.latitude)
                    : null,
                longitude: doctor.longitude != null
                    ? Number(doctor.longitude)
                    : null,
                distance_km: distanceKm,
                booked_today: Number(doctor.booked_today || 0),
                booked_today_times: bookedTimes,
                available_today: availableToday,
                available_times:
                    availability === "today" && availableToday
                        ? availableTimes
                        : [],
                budget_exact: budget.exact,
                match_score: score,
                match_percentage: score,
                reasons,
                is_alternative: false
            };
        });

        // ---------------------------------------------------------
        // EXACT RESULTS
        // All selected requirements must match.
        // ---------------------------------------------------------
        let exactMatches = allDoctors.filter((doctor) => {
            const hospitalOk =
                !requestedHospital ||
                Number(doctor.hospital_id) === requestedHospital;

            const budgetOk = !hasBudget || doctor.budget_exact;

            const availabilityOk =
                availability !== "today" ||
                doctor.available_today;

            return hospitalOk && budgetOk && availabilityOk;
        });

        // ---------------------------------------------------------
        // ALTERNATIVES
        // Only show alternatives when there is no exact result.
        // They keep the specialization, then relax hospital/budget.
        // ---------------------------------------------------------
        let alternatives = [];

        if (exactMatches.length === 0) {
            alternatives = allDoctors
                .filter((doctor) => {
                    const availabilityOk =
                        availability !== "today" ||
                        doctor.available_today;

                    return availabilityOk;
                })
                .map((doctor) => ({
                    ...doctor,
                    is_alternative: true
                }));

            // If nothing is available today, still return useful
            // suggestions instead of a blank screen.
            if (alternatives.length === 0) {
                alternatives = allDoctors.map((doctor) => ({
                    ...doctor,
                    is_alternative: true,
                    reasons: doctor.reasons.filter(
                        (reason) => reason !== "Available today"
                    ).concat("Check availability before booking")
                }));
            }
        }

        // ---------------------------------------------------------
        // RANKING
        // Exact matches: score, experience, fee.
        // Alternatives: score, then distance, experience, fee.
        // ---------------------------------------------------------
        const sortDoctors = (a, b) => {
            if (b.match_percentage !== a.match_percentage) {
                return b.match_percentage - a.match_percentage;
            }

            const aDistance = a.distance_km ?? Number.POSITIVE_INFINITY;
            const bDistance = b.distance_km ?? Number.POSITIVE_INFINITY;

            if (aDistance !== bDistance) {
                return aDistance - bDistance;
            }

            if (b.experience !== a.experience) {
                return b.experience - a.experience;
            }

            return a.fee - b.fee;
        };

        exactMatches.sort(sortDoctors);
        alternatives.sort(sortDoctors);

        exactMatches = exactMatches.slice(0, 10);
        alternatives = alternatives.slice(0, 10);

        res.json({
            success: true,
            count: exactMatches.length,
            exactMatchFound: exactMatches.length > 0,
            doctors: exactMatches,
            exactMatches,
            alternatives,
            message:
                exactMatches.length > 0
                    ? "Exact SmartMatch results found."
                    : "No exact match found. Showing the best alternatives."
        });
    } catch (error) {
        console.error("SmartMatch error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to find matching doctors.",
            error: error.message
        });
    }
};
