-- database/rides.sql

CREATE TABLE IF NOT EXISTS rides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    pickup_name VARCHAR(255) NOT NULL,
    pickup_location POINT NOT NULL SRID 4326,
    destination_name VARCHAR(255) NOT NULL,
    destination_location POINT NOT NULL SRID 4326,
    departure_time DATETIME NOT NULL,
    available_seats INT NOT NULL,
    fare_per_seat DECIMAL(10, 2) NOT NULL,
    distance_km DECIMAL(10, 2),
    estimated_duration INT, -- in minutes
    route_geometry LONGTEXT,
    ride_status ENUM('Scheduled', 'Started', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    is_recurring BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT
);

-- Indexes for performance
CREATE INDEX idx_rides_driver_id ON rides(driver_id);
CREATE INDEX idx_rides_departure_time ON rides(departure_time);
CREATE INDEX idx_rides_status ON rides(ride_status);

-- Spatial Indexes for geographic search
CREATE SPATIAL INDEX sp_idx_pickup ON rides(pickup_location);
CREATE SPATIAL INDEX sp_idx_destination ON rides(destination_location);
