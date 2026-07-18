-- MySQL 8.0 Database Schema for Enterprise Carpooling Platform
-- Module 2: User Profile Management - Saved Places Table

CREATE TABLE IF NOT EXISTS `saved_places` (
  `id` INT UNSIGNED AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `place_name` VARCHAR(100) NOT NULL COMMENT 'e.g. Home, Office, Airport, Metro, Custom',
  `address` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(10, 8) NOT NULL,
  `longitude` DECIMAL(11, 8) NOT NULL,
  `is_default` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '1 = default place, 0 = regular place',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_saved_places_user_id` (`user_id`),
  CONSTRAINT `fk_saved_places_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
