-- FoodBridge Relational Database Schema (PostgreSQL / MySQL)

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(25) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('RESTAURANT', 'NGO', 'VOLUNTEER', 'ADMIN')) NOT NULL,
    organization_name VARCHAR(150),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE food_donations (
    donation_id VARCHAR(20) PRIMARY KEY,
    donor_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    donor_name VARCHAR(150) NOT NULL,
    food_item VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity_kg DECIMAL(6, 2) NOT NULL CHECK (quantity_kg > 0),
    expiry_hours DECIMAL(5, 2) NOT NULL CHECK (expiry_hours > 0),
    expires_at TIMESTAMP NOT NULL,
    urgency_level VARCHAR(20) CHECK (urgency_level IN ('CRITICAL', 'EXPIRING SOON', 'FRESH')) NOT NULL,
    zone VARCHAR(80) NOT NULL,
    pickup_location TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Available', 'Claimed', 'Delivered', 'Expired')) DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pickup_claims (
    claim_id SERIAL PRIMARY KEY,
    donation_id VARCHAR(20) UNIQUE REFERENCES food_donations(donation_id) ON DELETE CASCADE,
    ngo_user_id INT REFERENCES users(user_id),
    claimed_by_name VARCHAR(150) NOT NULL,
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP NULL
);

CREATE INDEX idx_food_status ON food_donations(status);
CREATE INDEX idx_food_zone ON food_donations(zone);
