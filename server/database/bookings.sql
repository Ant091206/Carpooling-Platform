-- ====================================================================
-- Module 7: Booking System Migration
-- Run this SQL against your enterprise_carpool database
-- if Prisma migrate cannot run automatically
-- ====================================================================

CREATE TABLE IF NOT EXISTS `bookings` (
    `id`               INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `ride_id`          INT UNSIGNED     NOT NULL,
    `passenger_id`     INT UNSIGNED     NOT NULL,
    `driver_id`        INT UNSIGNED     NOT NULL,
    `requested_seats`  INT              NOT NULL,
    `status`           ENUM('PENDING','ACCEPTED','REJECTED','CANCELLED','COMPLETED') NOT NULL DEFAULT 'PENDING',
    `booking_date`     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `created_at`       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    CONSTRAINT `fk_booking_ride`      FOREIGN KEY (`ride_id`)      REFERENCES `rides`(`id`)  ON DELETE CASCADE,
    CONSTRAINT `fk_booking_passenger` FOREIGN KEY (`passenger_id`) REFERENCES `users`(`id`)  ON DELETE CASCADE,
    CONSTRAINT `fk_booking_driver`    FOREIGN KEY (`driver_id`)    REFERENCES `users`(`id`)  ON DELETE CASCADE,

    INDEX `idx_booking_ride_id`      (`ride_id`),
    INDEX `idx_booking_passenger_id` (`passenger_id`),
    INDEX `idx_booking_driver_id`    (`driver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
