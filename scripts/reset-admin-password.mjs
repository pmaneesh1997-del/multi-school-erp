import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

dotenv.config({ path: ".env.local" });

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "Admin";

if (!email || !email.includes("@") || !password || password.length < 12) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) before running this command.");
  process.exit(1);
}

const connection = await mysql.createConnection({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USERNAME ?? "root",
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_DATABASE ?? "multi_school_erp",
});

try {
  await connection.beginTransaction();
  await connection.query(
    "INSERT INTO school_groups (name, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)",
    ["Kartik Education Group", "kartik-education-group"],
  );
  const [[group]] = await connection.query("SELECT id FROM school_groups WHERE slug = ? LIMIT 1", ["kartik-education-group"]);
  await connection.query(
    "INSERT INTO schools (group_id, name, slug, timezone) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)",
    [group.id, "Main Campus", "main-campus", "UTC"],
  );
  const [[school]] = await connection.query("SELECT id FROM schools WHERE group_id = ? AND slug = ? LIMIT 1", [group.id, "main-campus"]);
  const passwordHash = await bcrypt.hash(password, 12);
  await connection.query(
    "INSERT INTO users (group_id, school_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, 'group_owner') ON DUPLICATE KEY UPDATE group_id = VALUES(group_id), school_id = VALUES(school_id), name = VALUES(name), password_hash = VALUES(password_hash), role = 'group_owner'",
    [group.id, school.id, name, email, passwordHash],
  );
  await connection.commit();
  console.log(`Admin account is ready for ${email}.`);
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}