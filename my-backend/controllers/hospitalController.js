import pool from "../db.js";

// =========================================================
// DEFAULT HOSPITAL IMAGES
// =========================================================

const defaultImages = [
    "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1200&auto=format&fit=crop"
];

// =========================================================
// FRONTEND FORMATTER
// =========================================================

function toFrontendHospital(row, index = 0) {

    const totalBeds =
        Number(row.total_beds || 0);

    const availableBeds =
        Number(row.available_beds || 0);

    const generalTotal =
        Number(row.general_total || totalBeds || 0);

    const generalAvailable =
        Number(
            row.general_available ??
            availableBeds ??
            0
        );

    const icuTotal =
        Number(row.icu_total || 0);

    const icuAvailable =
        Number(row.icu_available || 0);

    const ventilatorTotal =
        Number(row.ventilator_total || 0);

    const ventilatorAvailable =
        Number(row.ventilator_available || 0);

    const specialities =
        Array.isArray(row.specialities)
            ? row.specialities.filter(Boolean)
            : [];

    return {

        id:
            Number(row.hospital_id),

        name:
            row.hospital_name,

        image:
            row.image ||
            defaultImages[
                index % defaultImages.length
            ],

        rating:
            Number(row.rating || 4.5),

        address:
            [
                row.address,
                row.city
            ]
                .filter(Boolean)
                .join(", "),

        distance:
            row.distance != null
                ? `${Number(row.distance).toFixed(1)} km`
                : "—",

        distanceKm:
            row.distance != null
                ? Number(row.distance)
                : null,

        latitude:
            row.latitude != null
                ? Number(row.latitude)
                : null,

        longitude:
            row.longitude != null
                ? Number(row.longitude)
                : null,

        availableBeds,

        emergencyBeds:
            Number(
                row.emergency_beds || 0
            ),

        specialities:
            specialities.length
                ? specialities
                : ["General Medicine"],

        phone:
            row.contact_number ||
            "Not available",

        email:
            row.email ||
            "Not available",

        about:
            row.about ||
            `${row.hospital_name} provides healthcare services in ${
                row.city || "the local area"
            }.`,

        departments:
            specialities.length
                ? specialities
                : ["General Medicine"],

        beds: {

            general: {

                total:
                    generalTotal,

                occupied:
                    Math.max(
                        generalTotal -
                        generalAvailable,
                        0
                    )
            },

            icu: {

                total:
                    icuTotal,

                occupied:
                    Math.max(
                        icuTotal -
                        icuAvailable,
                        0
                    )
            },

            ventilator: {

                total:
                    ventilatorTotal,

                occupied:
                    Math.max(
                        ventilatorTotal -
                        ventilatorAvailable,
                        0
                    )
            }
        }
    };
}

// =========================================================
// GOOGLE PLACES HELPERS
// =========================================================

function normalizeHospitalName(value = "") {

    return String(value)
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(
            /\b(hospital|hospitals|clinic|clinics|medical|centre|center|healthcare|health|pvt|private|ltd|limited)\b/g,
            " "
        )
        .replace(/\s+/g, " ")
        .trim();
}


// =========================================================
// HOSPITAL NAME SIMILARITY
// =========================================================

function hospitalNameSimilarity(
    a = "",
    b = ""
) {

    const left =
        new Set(
            normalizeHospitalName(a)
                .split(" ")
                .filter(Boolean)
        );

    const right =
        new Set(
            normalizeHospitalName(b)
                .split(" ")
                .filter(Boolean)
        );

    if (
        !left.size ||
        !right.size
    ) {
        return 0;
    }

    const intersection =
        [...left]
            .filter(
                word =>
                    right.has(word)
            )
            .length;

    const union =
        new Set([
            ...left,
            ...right
        ]).size;

    return union
        ? intersection / union
        : 0;
}


// =========================================================
// DISTANCE CALCULATION
// =========================================================

function haversineKm(
    lat1,
    lng1,
    lat2,
    lng2
) {

    const R = 6371;

    const dLat =
        (
            Number(lat2) -
            Number(lat1)
        ) *
        Math.PI /
        180;

    const dLng =
        (
            Number(lng2) -
            Number(lng1)
        ) *
        Math.PI /
        180;

    const a =
        Math.sin(dLat / 2) ** 2 +

        Math.cos(
            Number(lat1) *
            Math.PI /
            180
        ) *

        Math.cos(
            Number(lat2) *
            Math.PI /
            180
        ) *

        Math.sin(dLng / 2) ** 2;

    return (
        2 *
        R *
        Math.asin(
            Math.sqrt(a)
        )
    );
}


// =========================================================
// MATCH GOOGLE HOSPITAL WITH MEDIFIND HOSPITAL
// =========================================================

function matchGoogleHospitalToMediFind(
    place,
    registeredHospitals
) {

    const googleName =
        place.displayName?.text ||
        "";

    const googleLat =
        Number(
            place.location?.latitude
        );

    const googleLng =
        Number(
            place.location?.longitude
        );

    let bestMatch = null;

    let bestScore = 0;


    for (
        const hospital
        of registeredHospitals
    ) {

        const nameScore =
            hospitalNameSimilarity(
                googleName,
                hospital.hospital_name
            );


        const hospitalLat =
            Number(
                hospital.latitude
            );

        const hospitalLng =
            Number(
                hospital.longitude
            );


        let nearby = false;

        let distanceScore = 0;


        if (
            Number.isFinite(
                googleLat
            ) &&
            Number.isFinite(
                googleLng
            ) &&
            Number.isFinite(
                hospitalLat
            ) &&
            Number.isFinite(
                hospitalLng
            )
        ) {

            const distance =
                haversineKm(
                    googleLat,
                    googleLng,
                    hospitalLat,
                    hospitalLng
                );


            nearby =
                distance <= 0.75;


            distanceScore =
                nearby
                    ? Math.max(
                        0,
                        1 -
                        distance /
                        0.75
                    )
                    : 0;
        }


        const score =
            nameScore >= 0.85
                ? 1
                :
                (
                    nameScore * 0.75
                ) +
                (
                    distanceScore * 0.25
                );


        const accepted =
            nameScore >= 0.75 ||
            (
                nearby &&
                nameScore >= 0.35
            );


        if (
            accepted &&
            score > bestScore
        ) {

            bestScore =
                score;

            bestMatch =
                hospital;
        }
    }


    return bestMatch;
}


// =========================================================
// FORMAT EXTERNAL GOOGLE HOSPITAL
// =========================================================

function toExternalHospital(
    place,
    userLatitude,
    userLongitude
) {

    const latitude =
        Number(
            place.location?.latitude
        );

    const longitude =
        Number(
            place.location?.longitude
        );


    const distanceKm =
        Number.isFinite(
            latitude
        ) &&
        Number.isFinite(
            longitude
        )
            ? haversineKm(
                userLatitude,
                userLongitude,
                latitude,
                longitude
            )
            : null;


    return {
    id:
        `google-${place.id}`,

    source:
        "google",

    registered:
        false,

    name:
        place.displayName?.text ||
        "Hospital",

    image:
        place?.photos?.[0]?.name
            ? `/hospitals/google-photo?name=${encodeURIComponent(
                place.photos[0].name
              )}`
            : null,

    rating:
        place.rating != null
            ? Number(place.rating)
            : null,

    address:
        place.formattedAddress ||
        place.shortFormattedAddress ||
        "Address not available",

    distance:
        distanceKm != null
            ? `${distanceKm.toFixed(1)} km`
            : "—",

        distanceKm,

        latitude:
            Number.isFinite(latitude)
                ? latitude
                : null,

        longitude:
            Number.isFinite(longitude)
                ? longitude
                : null,

        availableBeds:
            null,

        emergencyBeds:
            null,

        specialities:
            [],

        phone:
            place.nationalPhoneNumber ||
            place.internationalPhoneNumber ||
            "Not available",

        email:
            "Not available",

        about:
            "This hospital was found through Google Places and is not registered on MediFind.",

        departments:
            [],

        beds: {

            general: {
                total: 0,
                occupied: 0
            },

            icu: {
                total: 0,
                occupied: 0
            },

            ventilator: {
                total: 0,
                occupied: 0
            }
        },

        googlePlaceId:
            place.id ||
            null,

        googleMapsUri:
            place.googleMapsUri ||
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${
                    place.displayName?.text ||
                    "Hospital"
                } ${
                    place.formattedAddress ||
                    ""
                }`
            )}`
    };
}


// =========================================================
// FORMAT REGISTERED MEDIFIND HOSPITAL
// =========================================================

function toRegisteredNearbyHospital(
    row,
    index = 0
) {

    const hospital =
        toFrontendHospital(
            row,
            index
        );


    return {

        ...hospital,

        source:
            "medifind",

        registered:
            true,

        googlePlaceId:
            null,

        googleMapsUri:

            hospital.latitude != null &&
            hospital.longitude != null

                ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    hospital.latitude
                )}%2C${encodeURIComponent(
                    hospital.longitude
                )}`

                : null
    };
}


// =========================================================
// GOOGLE NEARBY HOSPITAL SEARCH
// =========================================================

async function searchGoogleNearbyHospitals(
    latitude,
    longitude,
    radiusMeters
) {

    const apiKey =
        process.env.GOOGLE_MAPS_API_KEY;


    if (!apiKey) {

        throw new Error(
            "GOOGLE_MAPS_API_KEY is missing from the backend .env file."
        );
    }


    const response =
        await fetch(
            "https://places.googleapis.com/v1/places:searchNearby",
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "X-Goog-Api-Key":
                        apiKey,

                    "X-Goog-FieldMask":
"places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.location,places.rating,places.nationalPhoneNumber,places.internationalPhoneNumber,places.googleMapsUri,places.primaryType,places.types,places.photos"                },


                body:
                    JSON.stringify({

                        includedTypes: [

                            "hospital",

                            "general_hospital",

                            "medical_center",

                            "medical_clinic"

                        ],

                        maxResultCount:
                            20,

                        rankPreference:
                            "DISTANCE",

                        regionCode:
                            "IN",

                        languageCode:
                            "en",

                        locationRestriction: {

                            circle: {

                                center: {

                                    latitude,

                                    longitude
                                },

                                radius:
                                    radiusMeters
                            }
                        }
                    })
            }
        );


    const data =
        await response.json();


    if (
        !response.ok
    ) {

        console.error(
            "Google Places API error:",
            data
        );


        throw new Error(
            data?.error?.message ||
            "Google Places could not find nearby hospitals."
        );
    }


    return Array.isArray(
        data.places
    )
        ? data.places
        : [];
}

export const getGoogleHospitalPhoto = async (req, res) => {
    try {

        const photoName = String(
            req.query.name || ""
        ).trim();

        if (!photoName) {
            return res.status(400).json({
                message: "Google photo name is required."
            });
        }

        // Only allow Google Places photo resources
        if (
            !photoName.startsWith("places/") ||
            photoName.includes("..") ||
            photoName.includes("\\")
        ) {
            return res.status(400).json({
                message: "Invalid Google photo resource."
            });
        }

        const apiKey =
            process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            console.error(
                "GOOGLE_MAPS_API_KEY is missing."
            );

            return res.status(500).json({
                message: "Google Maps configuration is missing."
            });
        }

        const googleUrl =
            `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1200`;

        const response = await fetch(
            googleUrl,
            {
                headers: {
                    "X-Goog-Api-Key": apiKey
                }
            }
        );

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Google photo error:",
                response.status,
                errorText
            );

            return res.status(
                response.status === 404
                    ? 404
                    : 502
            ).json({
                message:
                    "Unable to load hospital photo."
            });
        }

        const contentType =
            response.headers.get(
                "content-type"
            ) || "image/jpeg";

        const imageBuffer =
            Buffer.from(
                await response.arrayBuffer()
            );

        res.setHeader(
            "Content-Type",
            contentType
        );

        res.setHeader(
            "Cache-Control",
            "public, max-age=86400"
        );

        res.setHeader(
            "X-Content-Type-Options",
            "nosniff"
        );

        return res.send(imageBuffer);

    } catch (error) {

        console.error(
            "Google hospital photo proxy error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to load hospital photo."
        });
    }
};

// =========================================================
// GET ALL HOSPITALS
// =========================================================

export const getHospitals =
    async (
        req,
        res
    ) => {

        try {

            const result =
                await pool.query(`

                    SELECT

                        h.hospital_id,

                        h.hospital_name,

                        h.address,

                        h.city,

                        h.contact_number,

                        h.email,

                        h.total_beds,

                        h.available_beds,

                        h.latitude,

                        h.longitude,

                        COALESCE(
                            json_agg(
                                DISTINCT d.specialization
                            )
                            FILTER (
                                WHERE d.specialization IS NOT NULL
                            ),
                            '[]'::json
                        ) AS specialities,


                        COALESCE(
                            MAX(
                                CASE
                                    WHEN LOWER(b.bed_type) = 'general'
                                    THEN b.total_beds
                                END
                            ),
                            h.total_beds
                        ) AS general_total,


                        COALESCE(
                            MAX(
                                CASE
                                    WHEN LOWER(b.bed_type) = 'general'
                                    THEN b.available_beds
                                END
                            ),
                            h.available_beds
                        ) AS general_available,


                        COALESCE(
                            MAX(
                                CASE
                                    WHEN LOWER(b.bed_type) = 'icu'
                                    THEN b.total_beds
                                END
                            ),
                            0
                        ) AS icu_total,


                        COALESCE(
                            MAX(
                                CASE
                                    WHEN LOWER(b.bed_type) = 'icu'
                                    THEN b.available_beds
                                END
                            ),
                            0
                        ) AS icu_available,


                        COALESCE(
                            MAX(
                                CASE
                                    WHEN LOWER(b.bed_type)
                                    IN (
                                        'ventilator',
                                        'ventilator bed',
                                        'ventilators'
                                    )
                                    THEN b.total_beds
                                END
                            ),
                            0
                        ) AS ventilator_total,


                        COALESCE(
                            MAX(
                                CASE
                                    WHEN LOWER(b.bed_type)
                                    IN (
                                        'ventilator',
                                        'ventilator bed',
                                        'ventilators'
                                    )
                                    THEN b.available_beds
                                END
                            ),
                            0
                        ) AS ventilator_available


                    FROM hospitals h


                    LEFT JOIN doctors d
                        ON d.hospital_id =
                           h.hospital_id


                    LEFT JOIN beds b
                        ON b.hospital_id =
                           h.hospital_id


                    GROUP BY
                        h.hospital_id


                    ORDER BY
                        h.hospital_id ASC

                `);


            res.status(200).json(

                result.rows.map(
                    toFrontendHospital
                )

            );


        } catch (err) {

            console.error(
                "Get hospitals error:",
                err
            );


            res.status(500).json({

                message:
                    "Error fetching hospitals",

                error:
                    err.message
            });
        }
    };


// =========================================================
// FIND NEARBY HOSPITALS
// =========================================================

export const getNearbyHospitals =
    async (
        req,
        res
    ) => {

        try {

            const latitude =
                Number(
                    req.query.lat
                );

            const longitude =
                Number(
                    req.query.lng
                );


            // =====================================================
            // 5 KM SEARCH RANGE
            // =====================================================

            const radius =
                Number(
                    req.query.radius ||
                    5
                );


            if (
                !Number.isFinite(
                    latitude
                ) ||
                !Number.isFinite(
                    longitude
                )
            ) {

                return res.status(400).json({

                    message:
                        "Valid latitude and longitude are required."
                });
            }


            if (
                latitude < -90 ||
                latitude > 90 ||
                longitude < -180 ||
                longitude > 180
            ) {

                return res.status(400).json({

                    message:
                        "Invalid latitude or longitude."
                });
            }


            if (
                !Number.isFinite(
                    radius
                ) ||
                radius <= 0 ||
                radius > 5
            ) {

                return res.status(400).json({

                    message:
                        "Nearby hospital search radius must be between 1 and 5 km."
                });
            }


            // =====================================================
            // GET REGISTERED MEDIFIND HOSPITALS
            // =====================================================

            const registeredResult =
                await pool.query(`

                    SELECT

                        h.hospital_id,

                        h.hospital_name,

                        h.address,

                        h.city,

                        h.contact_number,

                        h.email,

                        h.total_beds,

                        h.available_beds,

                        h.latitude,

                        h.longitude,


                        COALESCE(
                            json_agg(
                                DISTINCT d.specialization
                            )
                            FILTER (
                                WHERE d.specialization IS NOT NULL
                            ),
                            '[]'::json
                        ) AS specialities,


                        COALESCE(
                            MAX(
                                CASE
                                    WHEN LOWER(b.bed_type) = 'general'
                                    THEN b.total_beds
                                END
                            ),
                            h.total_beds
                        ) AS general_total,


                        COALESCE(
                            MAX(
                                CASE
                                    WHEN LOWER(b.bed_type) = 'general'
                                    THEN b.available_beds
                                END
                            ),
                            h.available_beds
                        ) AS general_available,


                        COALESCE(
                            MAX(
                                CASE
                                    WHEN LOWER(b.bed_type) = 'icu'
                                    THEN b.total_beds
                                END
                            ),
                            0
                        ) AS icu_total,


                        COALESCE(
                            MAX(
                                CASE
                                    WHEN LOWER(b.bed_type) = 'icu'
                                    THEN b.available_beds
                                END
                            ),
                            0
                        ) AS icu_available,


                        COALESCE(
                            MAX(
                                CASE
                                    WHEN LOWER(b.bed_type)
                                    IN (
                                        'ventilator',
                                        'ventilator bed',
                                        'ventilators'
                                    )
                                    THEN b.total_beds
                                END
                            ),
                            0
                        ) AS ventilator_total,


                        COALESCE(
                            MAX(
                                CASE
                                    WHEN LOWER(b.bed_type)
                                    IN (
                                        'ventilator',
                                        'ventilator bed',
                                        'ventilators'
                                    )
                                    THEN b.available_beds
                                END
                            ),
                            0
                        ) AS ventilator_available


                    FROM hospitals h


                    LEFT JOIN doctors d
                        ON d.hospital_id =
                           h.hospital_id


                    LEFT JOIN beds b
                        ON b.hospital_id =
                           h.hospital_id


                    GROUP BY
                        h.hospital_id


                    ORDER BY
                        h.hospital_id ASC

                `);


            // =====================================================
            // GOOGLE PLACES SEARCH
            // =====================================================

            const googlePlaces =
                await searchGoogleNearbyHospitals(

                    latitude,

                    longitude,

                    radius * 1000

                );


            const results = [];

            const matchedRegisteredIds =
                new Set();


            // =====================================================
            // MERGE GOOGLE + MEDIFIND
            // =====================================================

            for (
                const place
                of googlePlaces
            ) {

                const matchedHospital =
                    matchGoogleHospitalToMediFind(

                        place,

                        registeredResult.rows

                    );


                // =================================================
                // REGISTERED HOSPITAL
                // =================================================

                if (
                    matchedHospital
                ) {

                    const googleLat =
                        Number(
                            place.location?.latitude
                        );

                    const googleLng =
                        Number(
                            place.location?.longitude
                        );


                    const distanceKm =

                        Number.isFinite(
                            googleLat
                        ) &&
                        Number.isFinite(
                            googleLng
                        )

                            ? haversineKm(

                                latitude,

                                longitude,

                                googleLat,

                                googleLng

                            )

                            : haversineKm(

                                latitude,

                                longitude,

                                Number(
                                    matchedHospital.latitude
                                ),

                                Number(
                                    matchedHospital.longitude
                                )

                            );


                    matchedRegisteredIds.add(

                        Number(
                            matchedHospital.hospital_id
                        )

                    );


                    const hospital =
                        toRegisteredNearbyHospital(

                            {
                                ...matchedHospital,

                                distance:
                                    distanceKm
                            },

                            results.length

                        );


                    results.push({

                        ...hospital,

                        googlePlaceId:
                            place.id ||
                            null,

                        googleMapsUri:
                            place.googleMapsUri ||
                            hospital.googleMapsUri

                    });


                }

                // =================================================
                // NOT REGISTERED
                // =================================================

                else {

                    results.push(

                        toExternalHospital(

                            place,

                            latitude,

                            longitude

                        )

                    );

                }
            }


            // =====================================================
            // ADD REGISTERED HOSPITALS GOOGLE DID NOT RETURN
            // =====================================================

            for (
                const row
                of registeredResult.rows
            ) {

                if (
                    matchedRegisteredIds.has(
                        Number(
                            row.hospital_id
                        )
                    )
                ) {
                    continue;
                }


                if (
                    row.latitude == null ||
                    row.longitude == null
                ) {
                    continue;
                }


                const distanceKm =
                    haversineKm(

                        latitude,

                        longitude,

                        Number(
                            row.latitude
                        ),

                        Number(
                            row.longitude
                        )

                    );


                if (
                    distanceKm <=
                    radius
                ) {

                    results.push(

                        toRegisteredNearbyHospital(

                            {
                                ...row,

                                distance:
                                    distanceKm
                            },

                            results.length

                        )

                    );
                }
            }


            // =====================================================
            // SORT BY DISTANCE
            // =====================================================

            results.sort(

                (a, b) =>

                    (
                        a.distanceKm ??
                        Infinity
                    )

                    -

                    (
                        b.distanceKm ??
                        Infinity
                    )

            );


            // =====================================================
            // RESPONSE
            // =====================================================

            res.status(200).json({

                userLocation: {

                    latitude,

                    longitude

                },

                radius,

                total:
                    results.length,

                hospitals:
                    results

            });


        } catch (err) {

            console.error(

                "Nearby hospitals error:",

                err

            );


            res.status(500).json({

                message:
                    err.message ||
                    "Error finding nearby hospitals",

                error:
                    err.message

            });

        }
    };


// =========================================================
// GET ONE HOSPITAL
// =========================================================

export const getHospitalById =
    async (
        req,
        res
    ) => {

        try {

            const {
                id
            } = req.params;


            const result =
                await pool.query(`

                    SELECT

                        h.hospital_id,

                        h.hospital_name,

                        h.address,

                        h.city,

                        h.contact_number,

                        h.email,

                        h.total_beds,

                        h.available_beds,

                        h.latitude,

                        h.longitude,


                        COALESCE(
                            json_agg(
                                DISTINCT d.specialization
                            )
                            FILTER (
                                WHERE d.specialization IS NOT NULL
                            ),
                            '[]'::json
                        ) AS specialities,


                        COALESCE(
                            MAX(
                                CASE
                                    WHEN LOWER(b.bed_type) = 'general'
                                    THEN b.total_beds
                                END
                            ),
                            h.total_beds
                        ) AS general_total,


                        COALESCE(
                            MAX(
                                CASE
                                    WHEN LOWER(b.bed_type) = 'general'
                                    THEN b.available_beds
                                END
                            ),
                            h.available_beds
                        ) AS general_available,


                        COALESCE(
                            MAX(
                                CASE
                                    WHEN LOWER(b.bed_type) = 'icu'
                                    THEN b.total_beds
                                END
                            ),
                            0
                        ) AS icu_total,


                        COALESCE(
                            MAX(
                                CASE
                                    WHEN LOWER(b.bed_type) = 'icu'
                                    THEN b.available_beds
                                END
                            ),
                            0
                        ) AS icu_available,


                        COALESCE(
                            MAX(
                                CASE
                                    WHEN LOWER(b.bed_type)
                                    IN (
                                        'ventilator',
                                        'ventilator bed',
                                        'ventilators'
                                    )
                                    THEN b.total_beds
                                END
                            ),
                            0
                        ) AS ventilator_total,


                        COALESCE(
                            MAX(
                                CASE
                                    WHEN LOWER(b.bed_type)
                                    IN (
                                        'ventilator',
                                        'ventilator bed',
                                        'ventilators'
                                    )
                                    THEN b.available_beds
                                END
                            ),
                            0
                        ) AS ventilator_available


                    FROM hospitals h


                    LEFT JOIN doctors d
                        ON d.hospital_id =
                           h.hospital_id


                    LEFT JOIN beds b
                        ON b.hospital_id =
                           h.hospital_id


                    WHERE
                        h.hospital_id =
                        $1


                    GROUP BY
                        h.hospital_id

                `, [
                    id
                ]);


            if (
                result.rows.length ===
                0
            ) {

                return res.status(404).json({

                    message:
                        "Hospital not found"

                });
            }


            res.status(200).json(

                toFrontendHospital(

                    result.rows[0],

                    Number(id) - 1

                )

            );


        } catch (err) {

            console.error(

                "Get hospital error:",

                err

            );


            res.status(500).json({

                message:
                    "Error fetching hospital",

                error:
                    err.message

            });

        }
    };


// =========================================================
// ADD HOSPITAL
// =========================================================

export const addHospital =
    async (
        req,
        res
    ) => {

        try {

            const {

                hospital_name,

                address,

                city,

                contact_number,

                email,

                total_beds,

                available_beds,

                latitude,

                longitude

            } = req.body;


            if (

                !hospital_name ||

                !address ||

                !city ||

                total_beds === undefined ||

                available_beds === undefined

            ) {

                return res.status(400).json({

                    message:
                        "Please fill all required fields"

                });
            }


            if (

                Number(total_beds) < 0 ||

                Number(available_beds) < 0 ||

                Number(available_beds) >
                Number(total_beds)

            ) {

                return res.status(400).json({

                    message:
                        "Invalid bed values"

                });
            }


            if (

                latitude !== undefined &&

                latitude !== null &&

                (

                    Number(latitude) < -90 ||

                    Number(latitude) > 90 ||

                    !Number.isFinite(
                        Number(latitude)
                    )

                )

            ) {

                return res.status(400).json({

                    message:
                        "Invalid latitude."

                });
            }


            if (

                longitude !== undefined &&

                longitude !== null &&

                (

                    Number(longitude) < -180 ||

                    Number(longitude) > 180 ||

                    !Number.isFinite(
                        Number(longitude)
                    )

                )

            ) {

                return res.status(400).json({

                    message:
                        "Invalid longitude."

                });
            }


            const result =
                await pool.query(`

                    INSERT INTO hospitals

                    (

                        hospital_name,

                        address,

                        city,

                        contact_number,

                        email,

                        total_beds,

                        available_beds,

                        latitude,

                        longitude

                    )

                    VALUES

                    (

                        $1,

                        $2,

                        $3,

                        $4,

                        $5,

                        $6,

                        $7,

                        $8,

                        $9

                    )

                    RETURNING *

                `, [

                    hospital_name,

                    address,

                    city,

                    contact_number ||
                        null,

                    email ||
                        null,

                    total_beds,

                    available_beds,

                    latitude !== undefined &&
                    latitude !== null

                        ? Number(
                            latitude
                        )

                        : null,

                    longitude !== undefined &&
                    longitude !== null

                        ? Number(
                            longitude
                        )

                        : null

                ]);


            res.status(201).json({

                message:
                    "Hospital added successfully",

                hospital:
                    result.rows[0]

            });


        } catch (err) {

            console.error(

                "Add hospital error:",

                err

            );


            res.status(500).json({

                message:
                    "Error adding hospital",

                error:
                    err.message

            });

        }
    };


// =========================================================
// UPDATE HOSPITAL
// =========================================================

export const updateHospital =
    async (
        req,
        res
    ) => {

        try {

            const {
                id
            } = req.params;


            const {

                hospital_name,

                address,

                city,

                contact_number,

                email,

                total_beds,

                available_beds,

                latitude,

                longitude

            } = req.body;


            if (

                !hospital_name ||

                !address ||

                !city ||

                total_beds === undefined ||

                available_beds === undefined

            ) {

                return res.status(400).json({

                    message:
                        "Please fill all required fields"

                });
            }


            if (

                Number(total_beds) < 0 ||

                Number(available_beds) < 0 ||

                Number(available_beds) >
                Number(total_beds)

            ) {

                return res.status(400).json({

                    message:
                        "Invalid bed values"

                });
            }


            if (

                latitude !== undefined &&

                latitude !== null &&

                (

                    Number(latitude) < -90 ||

                    Number(latitude) > 90 ||

                    !Number.isFinite(
                        Number(latitude)
                    )

                )

            ) {

                return res.status(400).json({

                    message:
                        "Invalid latitude."

                });
            }


            if (

                longitude !== undefined &&

                longitude !== null &&

                (

                    Number(longitude) < -180 ||

                    Number(longitude) > 180 ||

                    !Number.isFinite(
                        Number(longitude)
                    )

                )

            ) {

                return res.status(400).json({

                    message:
                        "Invalid longitude."

                });
            }


            const result =
                await pool.query(`

                    UPDATE hospitals

                    SET

                        hospital_name = $1,

                        address = $2,

                        city = $3,

                        contact_number = $4,

                        email = $5,

                        total_beds = $6,

                        available_beds = $7,

                        latitude = $8,

                        longitude = $9


                    WHERE

                        hospital_id = $10


                    RETURNING *

                `, [

                    hospital_name,

                    address,

                    city,

                    contact_number ||
                        null,

                    email ||
                        null,

                    total_beds,

                    available_beds,

                    latitude !== undefined &&
                    latitude !== null

                        ? Number(
                            latitude
                        )

                        : null,

                    longitude !== undefined &&
                    longitude !== null

                        ? Number(
                            longitude
                        )

                        : null,

                    id

                ]);


            if (
                result.rows.length ===
                0
            ) {

                return res.status(404).json({

                    message:
                        "Hospital not found"

                });
            }


            res.status(200).json({

                message:
                    "Hospital updated successfully",

                hospital:
                    result.rows[0]

            });


        } catch (err) {

            console.error(

                "Update hospital error:",

                err

            );


            res.status(500).json({

                message:
                    "Error updating hospital",

                error:
                    err.message

            });

        }
    };


// =========================================================
// DELETE HOSPITAL
// =========================================================

export const deleteHospital =
    async (
        req,
        res
    ) => {

        try {

            const {
                id
            } = req.params;


            const result =
                await pool.query(`

                    DELETE FROM hospitals

                    WHERE
                        hospital_id = $1

                    RETURNING *

                `, [
                    id
                ]);


            if (
                result.rows.length ===
                0
            ) {

                return res.status(404).json({

                    message:
                        "Hospital not found"

                });
            }


            res.status(200).json({

                message:
                    "Hospital deleted successfully",

                hospital:
                    result.rows[0]

            });


        } catch (err) {

            console.error(

                "Delete hospital error:",

                err

            );


            res.status(500).json({

                message:
                    "Error deleting hospital",

                error:
                    err.message

            });

        }
    };