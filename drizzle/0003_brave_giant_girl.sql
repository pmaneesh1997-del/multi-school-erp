CREATE TABLE `employee_attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_id` int NOT NULL,
	`attendance_date` date NOT NULL,
	`status` enum('present','absent','late','half_day') NOT NULL,
	`check_in` varchar(8),
	`check_out` varchar(8),
	`recorded_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employee_attendance_id` PRIMARY KEY(`id`),
	CONSTRAINT `employee_attendance_employee_date_unique` UNIQUE(`employee_id`,`attendance_date`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`employee_code` varchar(40) NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(254) NOT NULL,
	`phone` varchar(24),
	`department` varchar(100) NOT NULL,
	`designation` varchar(100) NOT NULL,
	`employment_type` enum('full_time','part_time','contract') NOT NULL DEFAULT 'full_time',
	`monthly_salary` int NOT NULL,
	`pf_deduction` int NOT NULL DEFAULT 0,
	`esi_deduction` int NOT NULL DEFAULT 0,
	`professional_tax` int NOT NULL DEFAULT 0,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`joined_on` date NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employees_id` PRIMARY KEY(`id`),
	CONSTRAINT `employees_school_code_unique` UNIQUE(`school_id`,`employee_code`)
);
--> statement-breakpoint
CREATE TABLE `leave_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_id` int NOT NULL,
	`leave_type` enum('casual','sick','unpaid') NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`reason` varchar(500) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewed_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leave_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payroll_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_id` int NOT NULL,
	`period` varchar(7) NOT NULL,
	`gross_pay` int NOT NULL,
	`deductions` int NOT NULL DEFAULT 0,
	`net_pay` int NOT NULL,
	`status` enum('draft','paid') NOT NULL DEFAULT 'draft',
	`paid_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payroll_entries_id` PRIMARY KEY(`id`),
	CONSTRAINT `payroll_employee_period_unique` UNIQUE(`employee_id`,`period`)
);
--> statement-breakpoint
ALTER TABLE `employee_attendance` ADD CONSTRAINT `employee_attendance_employee_id_employees_id_fk` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_attendance` ADD CONSTRAINT `employee_attendance_recorded_by_users_id_fk` FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_school_id_schools_id_fk` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leave_requests` ADD CONSTRAINT `leave_requests_employee_id_employees_id_fk` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leave_requests` ADD CONSTRAINT `leave_requests_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payroll_entries` ADD CONSTRAINT `payroll_entries_employee_id_employees_id_fk` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `employee_attendance_date_idx` ON `employee_attendance` (`attendance_date`);--> statement-breakpoint
CREATE INDEX `employees_school_idx` ON `employees` (`school_id`);--> statement-breakpoint
CREATE INDEX `leave_requests_employee_idx` ON `leave_requests` (`employee_id`);--> statement-breakpoint
CREATE INDEX `leave_requests_status_idx` ON `leave_requests` (`status`);--> statement-breakpoint
CREATE INDEX `payroll_period_idx` ON `payroll_entries` (`period`);