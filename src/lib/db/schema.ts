import {
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
