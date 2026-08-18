-- MediFind current-schema migration
-- Safe for an existing database: adds missing columns only.

ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS fee NUMERIC(10,2) NOT NULL DEFAULT 0;

ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS verification_otp VARCHAR(255);

ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS verification_otp_expires_at TIMESTAMP;

ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS verification_attempts INTEGER NOT NULL DEFAULT 0;

ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS verification_otp_hash VARCHAR(255);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS verification_otp_expires_at TIMESTAMP;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS reset_otp_hash VARCHAR(255);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS reset_otp_expires_at TIMESTAMP;
-- Fix missing bed timestamp column
ALTER TABLE beds
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Verify the doctor fee/verification columns after migration.
SELECT doctor_id, full_name, email, fee, email_verified
FROM doctors
ORDER BY doctor_id;
