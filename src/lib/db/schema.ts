import {
  index,
  int,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const schoolGroups = mysqlTable("school_groups", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const schools = mysqlTable("schools", {
  id: varchar("id", { length: 36 }).primaryKey(),
  groupId: varchar("group_id", { length: 36 }).notNull().references(() => schoolGroups.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  timezone: varchar("timezone", { length: 64 }).notNull().default("UTC"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("schools_group_slug_unique").on(table.groupId, table.slug)]);

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  groupId: varchar("group_id", { length: 36 }).notNull().references(() => schoolGroups.id, { onDelete: "cascade" }),
  schoolId: varchar("school_id", { length: 36 }).references(() => schools.id, { onDelete: "set null" }),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 40 }).notNull().default("school_admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("users_email_unique").on(table.email), index("users_group_idx").on(table.groupId)]);

export const sessions = mysqlTable("sessions", {
  tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  activeSchoolId: varchar("active_school_id", { length: 36 }).references(() => schools.id, { onDelete: "set null" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("sessions_user_idx").on(table.userId), index("sessions_expiry_idx").on(table.expiresAt)]);

export const students = mysqlTable("students", {
  id: varchar("id", { length: 36 }).primaryKey(),
  schoolId: varchar("school_id", { length: 36 }).notNull().references(() => schools.id, { onDelete: "cascade" }),
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
  schoolId: varchar("school_id", { length: 36 }).notNull().references(() => schools.id, { onDelete: "cascade" }),
  studentId: varchar("student_id", { length: 36 }).notNull().references(() => students.id, { onDelete: "cascade" }),
  attendanceDate: timestamp("attendance_date").notNull(),
  status: varchar("status", { length: 24 }).notNull(),
  recordedBy: varchar("recorded_by", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
}, (table) => [uniqueIndex("attendance_student_date_unique").on(table.studentId, table.attendanceDate), index("attendance_school_date_idx").on(table.schoolId, table.attendanceDate)]);
