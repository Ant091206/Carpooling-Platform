-- ============================================================
-- Module 10: Wallet & Payments
-- Enterprise Carpooling Platform
-- ============================================================
-- Run this AFTER the existing schema is applied.
-- All tables reference existing `users` and `bookings` tables.
-- ============================================================

-- ─── wallets ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `wallets` (
  `id`          INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED      NOT NULL,
  `balance`     DECIMAL(12, 2)    NOT NULL DEFAULT 0.00,
  `status`      ENUM('ACTIVE', 'SUSPENDED', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
  `created_at`  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY  `uq_wallet_user`  (`user_id`),
  INDEX       `idx_wallet_status` (`status`),
  CONSTRAINT  `fk_wallet_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── wallet_transactions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS `wallet_transactions` (
  `id`               INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `wallet_id`        INT UNSIGNED      NOT NULL,
  `user_id`          INT UNSIGNED      NOT NULL,
  `booking_id`       INT UNSIGNED      NULL,
  `payment_id`       INT UNSIGNED      NULL,
  `transaction_type` ENUM('RECHARGE', 'RIDE_PAYMENT', 'REFUND', 'ADJUSTMENT', 'REWARD')
                     NOT NULL,
  `amount`           DECIMAL(12, 2)    NOT NULL,
  `balance_before`   DECIMAL(12, 2)    NOT NULL,
  `balance_after`    DECIMAL(12, 2)    NOT NULL,
  `reference_no`     VARCHAR(64)       NOT NULL,
  `description`      VARCHAR(255)      NULL,
  `status`           ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'SUCCESS',
  `created_at`       TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY  `uq_txn_reference`    (`reference_no`),
  INDEX       `idx_txn_wallet_id`   (`wallet_id`),
  INDEX       `idx_txn_user_id`     (`user_id`),
  INDEX       `idx_txn_booking_id`  (`booking_id`),
  INDEX       `idx_txn_type`        (`transaction_type`),
  INDEX       `idx_txn_status`      (`status`),
  CONSTRAINT  `fk_txn_wallet`
    FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT  `fk_txn_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── payments ────────────────────────────────────────────────
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
  UNIQUE KEY  `uq_payment_booking`       (`booking_id`),
  INDEX       `idx_payment_payer`        (`payer_id`),
  INDEX       `idx_payment_receiver`     (`receiver_id`),
  INDEX       `idx_payment_status`       (`status`),
  INDEX       `idx_payment_method`       (`payment_method`),
  CONSTRAINT  `fk_payment_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT  `fk_payment_payer`
    FOREIGN KEY (`payer_id`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT  `fk_payment_receiver`
    FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
