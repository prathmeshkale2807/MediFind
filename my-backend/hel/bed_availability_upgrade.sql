-- MediFind Smart Bed Availability upgrade
-- Run once on an existing database.

ALTER TABLE beds
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_beds_hospital_type
    ON beds(hospital_id, bed_type);

CREATE INDEX IF NOT EXISTS idx_beds_updated_at
    ON beds(updated_at DESC);
