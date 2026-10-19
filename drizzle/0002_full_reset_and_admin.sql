DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `schools`;
DROP TABLE IF EXISTS `billing_invoices`;
DROP TABLE IF EXISTS `subscriptions`;
DROP TABLE IF EXISTS `school_groups`;

CREATE TABLE `school_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(160) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `school_groups_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `plan` enum('starter','growth','enterprise') NOT NULL DEFAULT 'starter',
  `status` enum('trialing','active','past_due','canceled','incomplete') NOT NULL DEFAULT 'trialing',
  `billing_interval` enum('month','year') NOT NULL DEFAULT 'month',
  `razorpay_customer_id` varchar(255) DEFAULT NULL,
  `razorpay_subscription_id` varchar(255) DEFAULT NULL,
  `current_period_start` datetime DEFAULT NULL,
  `current_period_end` datetime DEFAULT NULL,
  `trial_ends_at` datetime DEFAULT NULL,
  `cancel_at_period_end` int NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscriptions_group_unique` (`group_id`),
  UNIQUE KEY `subscriptions_razorpay_id_unique` (`razorpay_subscription_id`),
  KEY `subscriptions_status_idx` (`status`),
  CONSTRAINT `subscriptions_group_id_school_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `school_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `billing_invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `razorpay_payment_id` varchar(255) NOT NULL,
  `amount_paid` int NOT NULL DEFAULT 0,
  `currency` varchar(3) NOT NULL DEFAULT 'inr',
  `status` varchar(24) NOT NULL,
  `invoice_url` varchar(2048) DEFAULT NULL,
  `period_start` datetime DEFAULT NULL,
  `period_end` datetime DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `billing_invoice_razorpay_payment_unique` (`razorpay_payment_id`),
  KEY `billing_invoice_group_idx` (`group_id`),
  CONSTRAINT `billing_invoices_group_id_school_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `school_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `schools` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `name` varchar(160) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `timezone` varchar(64) NOT NULL DEFAULT 'UTC',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `schools_group_slug_unique` (`group_id`,`slug`),
  KEY `schools_group_idx` (`group_id`),
  CONSTRAINT `schools_group_id_school_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `school_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `school_id` int DEFAULT NULL,
  `name` varchar(160) NOT NULL,
  `email` varchar(254) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(40) NOT NULL DEFAULT 'school_admin',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_group_idx` (`group_id`),
  CONSTRAINT `users_group_id_school_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `school_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `users_school_id_schools_id_fk` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `sessions` (
  `token_hash` varchar(64) NOT NULL,
  `user_id` int NOT NULL,
  `active_school_id` int DEFAULT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`token_hash`),
  KEY `sessions_user_idx` (`user_id`),
  KEY `sessions_expiry_idx` (`expires_at`),
  CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sessions_active_school_id_schools_id_fk` FOREIGN KEY (`active_school_id`) REFERENCES `schools` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `school_id` int NOT NULL,
  `student_number` varchar(40) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `grade` varchar(40) NOT NULL,
  `section` varchar(40) NOT NULL,
  `status` varchar(24) NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `students_school_number_unique` (`school_id`,`student_number`),
  KEY `students_school_idx` (`school_id`),
  CONSTRAINT `students_school_id_schools_id_fk` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `school_id` int NOT NULL,
  `student_id` int NOT NULL,
  `attendance_date` timestamp NOT NULL,
  `status` varchar(24) NOT NULL,
  `recorded_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `attendance_student_date_unique` (`student_id`,`attendance_date`),
  KEY `attendance_school_date_idx` (`school_id`,`attendance_date`),
  CONSTRAINT `attendance_school_id_schools_id_fk` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_recorded_by_users_id_fk` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `school_groups` (`name`, `slug`) VALUES ('Kartik Education Group', 'kartik-education-group');

INSERT INTO `schools` (`group_id`, `name`, `slug`, `timezone`)
SELECT `id`, 'Main Campus', 'main-campus', 'UTC' FROM `school_groups` WHERE `slug` = 'kartik-education-group';

INSERT INTO `users` (`group_id`, `school_id`, `name`, `email`, `password_hash`, `role`)
SELECT sg.id, sch.id, 'Admin', 'admin@kartik.education', '$2b$10$sVEOYoD5Krkj.Gfr6.6a9ugh7nHpgwlG1PibbBJERL8uVs3.cUxmS', 'group_owner'
FROM `school_groups` sg
JOIN `schools` sch ON sch.slug = 'main-campus'
WHERE sg.slug = 'kartik-education-group';
