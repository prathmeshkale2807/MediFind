-- Run this only if the corresponding tables do not already exist.
-- If you already created the tables, keep your existing schema/data.

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hospitals (
    hospital_id SERIAL PRIMARY KEY,
    hospital_name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    contact_number VARCHAR(30),
    email VARCHAR(150),
    total_beds INTEGER NOT NULL DEFAULT 0 CHECK (total_beds >= 0),
    available_beds INTEGER NOT NULL DEFAULT 0 CHECK (available_beds >= 0 AND available_beds <= total_beds)
);

CREATE TABLE IF NOT EXISTS doctors (
    doctor_id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    full_name VARCHAR(120) NOT NULL,
    specialization VARCHAR(120) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(150),
    experience INTEGER NOT NULL DEFAULT 0 CHECK (experience >= 0)
);

CREATE TABLE IF NOT EXISTS beds (
    bed_id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
    bed_type VARCHAR(50) NOT NULL,
    total_beds INTEGER NOT NULL DEFAULT 0 CHECK (total_beds >= 0),
    available_beds INTEGER NOT NULL DEFAULT 0 CHECK (available_beds >= 0 AND available_beds <= total_beds),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
