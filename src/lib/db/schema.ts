import {
  date,
  datetime,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const schoolGroups = mysqlTable("school_groups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("group_id").notNull().references(() => schoolGroups.id, { onDelete: "cascade" }),
  plan: mysqlEnum("plan", ["starter", "growth", "enterprise"]).notNull().default("starter"),
  status: mysqlEnum("status", ["trialing", "active", "past_due", "canceled", "incomplete"]).notNull().default("trialing"),
  billingInterval: mysqlEnum("billing_interval", ["month", "year"]).notNull().default("month"),
  razorpayCustomerId: varchar("razorpay_customer_id", { length: 255 }),
  razorpaySubscriptionId: varchar("razorpay_subscription_id", { length: 255 }),
  currentPeriodStart: datetime("current_period_start", { mode: "date" }),
  currentPeriodEnd: datetime("current_period_end", { mode: "date" }),
  trialEndsAt: datetime("trial_ends_at", { mode: "date" }),
  cancelAtPeriodEnd: int("cancel_at_period_end").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("subscriptions_group_unique").on(table.groupId), uniqueIndex("subscriptions_razorpay_id_unique").on(table.razorpaySubscriptionId), index("subscriptions_status_idx").on(table.status)]);

export const billingInvoices = mysqlTable("billing_invoices", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("group_id").notNull().references(() => schoolGroups.id, { onDelete: "cascade" }),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }).notNull(),
  amountPaid: int("amount_paid").notNull().default(0),
  currency: varchar("currency", { length: 3 }).notNull().default("inr"),
  status: varchar("status", { length: 24 }).notNull(),
  invoiceUrl: varchar("invoice_url", { length: 2048 }),
  periodStart: datetime("period_start", { mode: "date" }),
  periodEnd: datetime("period_end", { mode: "date" }),
  paidAt: datetime("paid_at", { mode: "date" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("billing_invoice_razorpay_payment_unique").on(table.razorpayPaymentId), index("billing_invoice_group_idx").on(table.groupId)]);

export const schools = mysqlTable("schools", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("group_id").notNull().references(() => schoolGroups.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  timezone: varchar("timezone", { length: 64 }).notNull().default("UTC"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("schools_group_slug_unique").on(table.groupId, table.slug)]);

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("group_id").notNull().references(() => schoolGroups.id, { onDelete: "cascade" }),
  schoolId: int("school_id").references(() => schools.id, { onDelete: "set null" }),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 40 }).notNull().default("school_admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("users_email_unique").on(table.email), index("users_group_idx").on(table.groupId)]);

export const sessions = mysqlTable("sessions", {
  tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  activeSchoolId: int("active_school_id").references(() => schools.id, { onDelete: "set null" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("sessions_user_idx").on(table.userId), index("sessions_expiry_idx").on(table.expiresAt)]);

export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  schoolId: int("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
  studentNumber: varchar("student_number", { length: 40 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  grade: varchar("grade", { length: 40 }).notNull(),
  section: varchar("section", { length: 40 }).notNull(),
  status: varchar("status", { length: 24 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("students_school_number_unique").on(table.schoolId, table.studentNumber), index("students_school_idx").on(table.schoolId)]);

export const attendance = mysqlTable("attendance", {
  id: int("id").autoincrement().primaryKey(),
  schoolId: int("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
  studentId: int("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  attendanceDate: timestamp("attendance_date").notNull(),
  status: varchar("status", { length: 24 }).notNull(),
  recordedBy: int("recorded_by").references(() => users.id, { onDelete: "set null" }),
}, (table) => [uniqueIndex("attendance_student_date_unique").on(table.studentId, table.attendanceDate), index("attendance_school_date_idx").on(table.schoolId, table.attendanceDate)]);

export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  schoolId: int("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
  employeeCode: varchar("employee_code", { length: 40 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  phone: varchar("phone", { length: 24 }),
  department: varchar("department", { length: 100 }).notNull(),
  designation: varchar("designation", { length: 100 }).notNull(),
  employmentType: mysqlEnum("employment_type", ["full_time", "part_time", "contract"]).notNull().default("full_time"),
  monthlySalary: int("monthly_salary").notNull(),
  pfDeduction: int("pf_deduction").notNull().default(0),
  esiDeduction: int("esi_deduction").notNull().default(0),
  professionalTax: int("professional_tax").notNull().default(0),
  status: mysqlEnum("status", ["active", "inactive"]).notNull().default("active"),
  joinedOn: date("joined_on", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("employees_school_code_unique").on(table.schoolId, table.employeeCode), index("employees_school_idx").on(table.schoolId)]);

export const employeeAttendance = mysqlTable("employee_attendance", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  attendanceDate: date("attendance_date", { mode: "string" }).notNull(),
  status: mysqlEnum("status", ["present", "absent", "late", "half_day"]).notNull(),
  checkIn: varchar("check_in", { length: 8 }),
  checkOut: varchar("check_out", { length: 8 }),
  recordedBy: int("recorded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("employee_attendance_employee_date_unique").on(table.employeeId, table.attendanceDate), index("employee_attendance_date_idx").on(table.attendanceDate)]);

export const leaveRequests = mysqlTable("leave_requests", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  leaveType: mysqlEnum("leave_type", ["casual", "sick", "unpaid"]).notNull(),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  reason: varchar("reason", { length: 500 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).notNull().default("pending"),
  reviewedBy: int("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("leave_requests_employee_idx").on(table.employeeId), index("leave_requests_status_idx").on(table.status)]);

export const payrollEntries = mysqlTable("payroll_entries", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  period: varchar("period", { length: 7 }).notNull(),
  grossPay: int("gross_pay").notNull(),
  deductions: int("deductions").notNull().default(0),
  netPay: int("net_pay").notNull(),
  status: mysqlEnum("status", ["draft", "paid"]).notNull().default("draft"),
  paidAt: datetime("paid_at", { mode: "date" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("payroll_employee_period_unique").on(table.employeeId, table.period), index("payroll_period_idx").on(table.period)]);
