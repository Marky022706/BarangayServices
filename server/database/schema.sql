-- Barangay e-Services System Database Schema
-- Database: barangay_eservices_db

CREATE DATABASE IF NOT EXISTS `barangay_eservices_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `barangay_eservices_db`;

-- 1. Users table (Barangay Staff, Admins, and Registered Residents)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` ENUM('admin', 'staff', 'resident') NOT NULL DEFAULT 'staff',
  `email` VARCHAR(100) NULL,
  `contact_number` VARCHAR(30) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_username` (`username`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Services table
CREATE TABLE IF NOT EXISTS `services` (
  `id` VARCHAR(50) PRIMARY KEY,
  `title` VARCHAR(100) NOT NULL,
  `short_description` TEXT NOT NULL,
  `full_description` TEXT NOT NULL,
  `icon_name` VARCHAR(50) NOT NULL,
  `standard_fee` VARCHAR(100) NOT NULL,
  `processing_time` VARCHAR(100) NOT NULL,
  `requirements_json` JSON NOT NULL,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Atomic Reference & Control Number Generator table
CREATE TABLE IF NOT EXISTS `reference_counter` (
  `category` VARCHAR(20) NOT NULL,
  `year` INT NOT NULL,
  `last_number` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`category`, `year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Applications table
CREATE TABLE IF NOT EXISTS `applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `app_code` VARCHAR(50) NOT NULL UNIQUE,
  `reference_number` VARCHAR(50) NOT NULL UNIQUE,
  `control_number` VARCHAR(50) NULL UNIQUE,
  `document_type` VARCHAR(50) NOT NULL,
  `status` ENUM('Pending Review', 'Under Verification', 'Approved', 'Rejected', 'Ready for Claiming', 'Successful') NOT NULL DEFAULT 'Pending Review',
  `user_id` INT NULL,

  -- Personal Information
  `first_name` VARCHAR(100) NOT NULL,
  `middle_name` VARCHAR(100) NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `suffix` VARCHAR(20) NULL,
  `date_of_birth` DATE NOT NULL,
  `place_of_birth` VARCHAR(150) NOT NULL,
  `civil_status` VARCHAR(30) NOT NULL,
  `contact_number` VARCHAR(30) NOT NULL,
  `email` VARCHAR(100) NULL,
  `house_street` VARCHAR(200) NULL,
  `purok_sitio` VARCHAR(100) NOT NULL,
  `barangay` VARCHAR(100) NOT NULL DEFAULT 'Barangay San Isidro',
  `city_municipality` VARCHAR(100) NOT NULL DEFAULT 'Quezon City',
  `province` VARCHAR(100) NOT NULL DEFAULT 'Metro Manila',

  -- Document Specific Details
  `purpose` VARCHAR(255) NOT NULL,
  `other_purpose` VARCHAR(255) NULL,
  `assistance_type` VARCHAR(255) NULL,
  `additional_info` TEXT NULL,
  `length_of_residency` VARCHAR(50) NULL,

  -- Payment details
  `payment_method` ENUM('gcash', 'pay_on_pickup') NOT NULL DEFAULT 'pay_on_pickup',
  `payment_status` ENUM('Pending', 'Paid', 'Waived') NOT NULL DEFAULT 'Pending',
  `gcash_number` VARCHAR(30) NULL,
  `gcash_name` VARCHAR(100) NULL,
  `gcash_reference_number` VARCHAR(50) NULL,
  `amount_paid` VARCHAR(50) NULL,

  -- Staff review and processing
  `remarks` TEXT NULL,
  `rejection_reason` TEXT NULL,
  `verified_by` VARCHAR(100) NULL,
  `processed_by_user_id` INT NULL,

  -- Timestamps
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX `idx_reference` (`reference_number`),
  INDEX `idx_control` (`control_number`),
  INDEX `idx_doc_type` (`document_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_applicant_name` (`last_name`, `first_name`),
  CONSTRAINT `fk_app_document_type` FOREIGN KEY (`document_type`) REFERENCES `services`(`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_app_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_app_processed_by` FOREIGN KEY (`processed_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Application History / Audit Log table
CREATE TABLE IF NOT EXISTS `application_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_id` INT NOT NULL,
  `previous_status` VARCHAR(50) NULL,
  `new_status` VARCHAR(50) NOT NULL,
  `action_type` VARCHAR(50) NOT NULL,
  `remarks` TEXT NULL,
  `changed_by_name` VARCHAR(100) NOT NULL DEFAULT 'System',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_history_app` (`application_id`),
  CONSTRAINT `fk_history_app` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
