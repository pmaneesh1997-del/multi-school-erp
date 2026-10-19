CREATE TABLE `attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`student_id` int NOT NULL,
	`attendance_date` timestamp NOT NULL,
	`status` varchar(24) NOT NULL,
	`recorded_by` int,
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`),
	CONSTRAINT `attendance_student_date_unique` UNIQUE(`student_id`,`attendance_date`)
);
--> statement-breakpoint
CREATE TABLE `billing_invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int NOT NULL,
	`razorpay_payment_id` varchar(255) NOT NULL,
	`amount_paid` int NOT NULL DEFAULT 0,
	`currency` varchar(3) NOT NULL DEFAULT 'inr',
	`status` varchar(24) NOT NULL,
	`invoice_url` varchar(2048),
	`period_start` datetime,
	`period_end` datetime,
	`paid_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `billing_invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `billing_invoice_razorpay_payment_unique` UNIQUE(`razorpay_payment_id`)
);
--> statement-breakpoint
CREATE TABLE `school_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `school_groups_id` PRIMARY KEY(`id`),
	CONSTRAINT `school_groups_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `schools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`timezone` varchar(64) NOT NULL DEFAULT 'UTC',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `schools_id` PRIMARY KEY(`id`),
	CONSTRAINT `schools_group_slug_unique` UNIQUE(`group_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` varchar(64) NOT NULL,
	`user_id` int NOT NULL,
	`active_school_id` int,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_token_hash` PRIMARY KEY(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`student_number` varchar(40) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`grade` varchar(40) NOT NULL,
	`section` varchar(40) NOT NULL,
	`status` varchar(24) NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `students_id` PRIMARY KEY(`id`),
	CONSTRAINT `students_school_number_unique` UNIQUE(`school_id`,`student_number`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int NOT NULL,
	`plan` enum('starter','growth','enterprise') NOT NULL DEFAULT 'starter',
	`status` enum('trialing','active','past_due','canceled','incomplete') NOT NULL DEFAULT 'trialing',
	`billing_interval` enum('month','year') NOT NULL DEFAULT 'month',
	`razorpay_customer_id` varchar(255),
	`razorpay_subscription_id` varchar(255),
	`current_period_start` datetime,
	`current_period_end` datetime,
	`trial_ends_at` datetime,
	`cancel_at_period_end` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_group_unique` UNIQUE(`group_id`),
	CONSTRAINT `subscriptions_razorpay_id_unique` UNIQUE(`razorpay_subscription_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int NOT NULL,
	`school_id` int,
	`name` varchar(160) NOT NULL,
	`email` varchar(254) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` varchar(40) NOT NULL DEFAULT 'school_admin',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_school_id_schools_id_fk` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_recorded_by_users_id_fk` FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `billing_invoices` ADD CONSTRAINT `billing_invoices_group_id_school_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `school_groups`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `schools` ADD CONSTRAINT `schools_group_id_school_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `school_groups`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_active_school_id_schools_id_fk` FOREIGN KEY (`active_school_id`) REFERENCES `schools`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_school_id_schools_id_fk` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_group_id_school_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `school_groups`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_group_id_school_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `school_groups`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_school_id_schools_id_fk` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `attendance_school_date_idx` ON `attendance` (`school_id`,`attendance_date`);--> statement-breakpoint
CREATE INDEX `billing_invoice_group_idx` ON `billing_invoices` (`group_id`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expiry_idx` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE INDEX `students_school_idx` ON `students` (`school_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_status_idx` ON `subscriptions` (`status`);--> statement-breakpoint
CREATE INDEX `users_group_idx` ON `users` (`group_id`);