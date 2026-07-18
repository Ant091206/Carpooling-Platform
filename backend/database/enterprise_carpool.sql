-- ============================================================
-- Enterprise Carpooling Platform — Complete MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS `enterprise_carpool`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `enterprise_carpool`;

-- ─── 1. organizations ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS `organizations` (
  `id`           INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `name`         VARCHAR(150)      NOT NULL,
  `company_code` VARCHAR(50)       NOT NULL,
  `email`        VARCHAR(100)      NOT NULL,
  `phone`        VARCHAR(20)       NULL,
  `address`      TEXT              NULL,
  `logo`         VARCHAR(255)      NULL,
  `website`      VARCHAR(255)      NULL,
  `status`       ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `created_at`   TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_org_company_code` (`company_code`),
  INDEX `idx_org_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 2. users ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `organization_id` INT UNSIGNED      NOT NULL,
  `employee_id`     VARCHAR(50)       NOT NULL,
  `name`            VARCHAR(100)      NOT NULL,
  `email`           VARCHAR(100)      NOT NULL,
  `password`        VARCHAR(255)      NOT NULL,
  `phone`           VARCHAR(20)       NULL,
  `department`      VARCHAR(100)      NULL,
  `designation`     VARCHAR(100)      NULL,
  `avatar`          VARCHAR(255)      NULL,
  `role`            ENUM('ADMIN', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
  `status`          ENUM('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `last_login`      TIMESTAMP         NULL,
  `created_at`      TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_email` (`email`),
  UNIQUE KEY `idx_user_org_emp` (`organization_id`, `employee_id`),
  INDEX `idx_user_role` (`role`),
  INDEX `idx_user_status` (`status`),
  CONSTRAINT `fk_user_org`
    FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 3. saved_places ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `saved_places` (
  `id`          INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED      NOT NULL,
  `place_name`  VARCHAR(100)      NOT NULL,
  `address`     VARCHAR(255)      NOT NULL,
  `latitude`    DECIMAL(10, 8)    NOT NULL,
  `longitude`   DECIMAL(11, 8)    NOT NULL,
  `is_default`  TINYINT           NOT NULL DEFAULT 0,
  `created_at`  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  INDEX `idx_saved_places_user_id` (`user_id`),
  CONSTRAINT `fk_saved_places_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 4. refresh_tokens ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id`         INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `user_id`    INT UNSIGNED      NOT NULL,
  `token`      VARCHAR(512)      NOT NULL,
  `expires_at` TIMESTAMP         NOT NULL,
  `created_at` TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_refresh_token` (`token`),
  INDEX `idx_refresh_user_id` (`user_id`),
  CONSTRAINT `fk_refresh_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 5. vehicles ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `vehicles` (
  `id`           INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `user_id`      INT UNSIGNED      NOT NULL,
  `model`        VARCHAR(100)      NOT NULL,
  `plate_number` VARCHAR(50)       NOT NULL,
  `color`        VARCHAR(50)       NOT NULL,
  `capacity`     INT               NOT NULL,
  `type`         VARCHAR(50)       NULL,
  `created_at`   TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_vehicle_plate` (`plate_number`),
  INDEX `idx_vehicles_user_id` (`user_id`),
  CONSTRAINT `fk_vehicle_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 6. rides ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `rides` (
  `id`                   INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `driver_id`            INT UNSIGNED      NOT NULL,
  `vehicle_id`           INT UNSIGNED      NOT NULL,
  `pickup_name`          VARCHAR(255)      NOT NULL,
  `pickup_location`      POINT             NOT NULL,
  `destination_name`     VARCHAR(255)      NOT NULL,
  `destination_location` POINT             NOT NULL,
  `departure_time`       DATETIME          NOT NULL,
  `available_seats`      INT               NOT NULL,
  `fare_per_seat`        DECIMAL(10, 2)    NOT NULL,
  `distance_km`          DECIMAL(10, 2)    NULL,
  `estimated_duration`   INT               NULL,
  `route_geometry`       LONGTEXT          NULL,
  `ride_status`          ENUM('Scheduled', 'Started', 'In Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Scheduled',
  `is_recurring`         TINYINT(1)        NOT NULL DEFAULT 0,
  `notes`                TEXT              NULL,
  `created_at`           TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  INDEX `idx_rides_driver_id` (`driver_id`),
  INDEX `idx_rides_departure_time` (`departure_time`),
  INDEX `idx_rides_status` (`ride_status`),
  CONSTRAINT `fk_ride_driver`
    FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_ride_vehicle`
    FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 7. bookings ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `bookings` (
  `id`              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `ride_id`         INT UNSIGNED      NOT NULL,
  `passenger_id`    INT UNSIGNED      NOT NULL,
  `driver_id`       INT UNSIGNED      NOT NULL,
  `requested_seats` INT               NOT NULL,
  `status`          ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
  `booking_date`    TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at`      TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  INDEX `idx_booking_ride_id` (`ride_id`),
  INDEX `idx_booking_passenger_id` (`passenger_id`),
  INDEX `idx_booking_driver_id` (`driver_id`),
  CONSTRAINT `fk_booking_ride`
    FOREIGN KEY (`ride_id`) REFERENCES `rides` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_booking_passenger`
    FOREIGN KEY (`passenger_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_booking_driver`
    FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 8. trips ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `trips` (
  `id`           INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `ride_id`      INT UNSIGNED      NOT NULL,
  `booking_id`   INT UNSIGNED      NOT NULL,
  `driver_id`    INT UNSIGNED      NOT NULL,
  `passenger_id` INT UNSIGNED      NOT NULL,
  `status`       ENUM('BOOKED', 'ACCEPTED', 'STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'BOOKED',
  `started_at`   TIMESTAMP         NULL,
  `completed_at` TIMESTAMP         NULL,
  `created_at`   TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_trip_booking` (`booking_id`),
  INDEX `idx_trip_ride_id` (`ride_id`),
  INDEX `idx_trip_booking_id` (`booking_id`),
  INDEX `idx_trip_driver_id` (`driver_id`),
  INDEX `idx_trip_passenger_id` (`passenger_id`),
  CONSTRAINT `fk_trip_ride`
    FOREIGN KEY (`ride_id`) REFERENCES `rides` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_trip_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_trip_driver`
    FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_trip_passenger`
    FOREIGN KEY (`passenger_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 9. wallets ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `wallets` (
  `id`          INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED      NOT NULL,
  `balance`     DECIMAL(12, 2)    NOT NULL DEFAULT 0.00,
  `status`      ENUM('ACTIVE', 'SUSPENDED', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
  `created_at`  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_wallet_user` (`user_id`),
  INDEX `idx_wallet_status` (`status`),
  CONSTRAINT `fk_wallet_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 10. wallet_transactions ─────────────────────────────────
CREATE TABLE IF NOT EXISTS `wallet_transactions` (
  `id`               INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `wallet_id`        INT UNSIGNED      NOT NULL,
  `user_id`          INT UNSIGNED      NOT NULL,
  `booking_id`       INT UNSIGNED      NULL,
  `payment_id`       INT UNSIGNED      NULL,
  `transaction_type` ENUM('RECHARGE', 'RIDE_PAYMENT', 'REFUND', 'ADJUSTMENT', 'REWARD') NOT NULL,
  `amount`           DECIMAL(12, 2)    NOT NULL,
  `balance_before`   DECIMAL(12, 2)    NOT NULL,
  `balance_after`    DECIMAL(12, 2)    NOT NULL,
  `reference_no`     VARCHAR(64)       NOT NULL,
  `description`      VARCHAR(255)      NULL,
  `status`           ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'SUCCESS',
  `created_at`       TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_txn_reference` (`reference_no`),
  INDEX `idx_txn_wallet_id` (`wallet_id`),
  INDEX `idx_txn_user_id` (`user_id`),
  INDEX `idx_txn_booking_id` (`booking_id`),
  INDEX `idx_txn_type` (`transaction_type`),
  INDEX `idx_txn_status` (`status`),
  CONSTRAINT `fk_txn_wallet`
    FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_txn_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 11. payments ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `payments` (
  `id`                    INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `booking_id`            INT UNSIGNED      NOT NULL,
  `payer_id`              INT UNSIGNED      NOT NULL,
  `receiver_id`           INT UNSIGNED      NOT NULL,
  `payment_method`        ENUM('WALLET', 'CASH', 'UPI', 'RAZORPAY') NOT NULL,
  `amount`                DECIMAL(12, 2)    NOT NULL,
  `status`                ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  `transaction_reference` VARCHAR(128)      NULL,
  `gateway_order_id`      VARCHAR(128)      NULL,
  `gateway_payment_id`    VARCHAR(128)      NULL,
  `gateway_signature`     VARCHAR(256)      NULL,
  `paid_at`               TIMESTAMP         NULL,
  `created_at`            TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_payment_booking` (`booking_id`),
  INDEX `idx_payment_payer` (`payer_id`),
  INDEX `idx_payment_receiver` (`receiver_id`),
  INDEX `idx_payment_status` (`status`),
  INDEX `idx_payment_method` (`payment_method`),
  CONSTRAINT `fk_payment_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_payment_payer`
    FOREIGN KEY (`payer_id`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_payment_receiver`
    FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Initial Seed Data ───────────────────────────────────────
INSERT INTO `organizations` (`id`, `name`, `company_code`, `email`, `phone`, `status`)
VALUES (1, 'Acme Corporation', 'ACME001', 'contact@acme.com', '+1234567890', 'ACTIVE')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
