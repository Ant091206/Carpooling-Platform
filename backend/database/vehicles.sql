-- database/vehicles.sql

CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    vehicle_name VARCHAR(100) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(30),
    fuel_type ENUM('Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid') NOT NULL,
    seat_capacity INT NOT NULL CHECK (seat_capacity >= 1 AND seat_capacity <= 10),
    vehicle_image VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index on owner_id for faster lookups when getting a user's vehicles
CREATE INDEX idx_vehicles_owner_id ON vehicles(owner_id);

-- Index on registration_number for quick uniqueness checks
CREATE INDEX idx_vehicles_registration ON vehicles(registration_number);
