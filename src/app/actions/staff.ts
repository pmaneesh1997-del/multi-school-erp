'use server';

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { employeeAttendance, employees, leaveRequests, payrollEntries, schools } from "@/lib/db/schema";

const peopleAdmins = new Set(["platform_admin", "group_owner", "group_admin", "school_admin", "hr_manager"]);
const managers = new Set(["platform_admin", "group_owner", "group_admin", "school_admin"]);
const employeeSchema = z.object({
  schoolId: z.coerce.number().int().positive(),
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(24).optional(),
  department: z.string().trim().min(1).max(100),
  designation: z.string().trim().min(1).max(100),
  employmentType: z.enum(["full_time", "part_time", "contract"]),
  monthlySalary: z.coerce.number().int().min(0).max(100_000_000),
  pfDeduction: z.coerce.number().int().min(0).max(100_000_000),
  esiDeduction: z.coerce.number().int().min(0).max(100_000_000),
  professionalTax: z.coerce.number().int().min(0).max(100_000_000),
  joinedOn: z.iso.date(),
}).refine((employee) => employee.pfDeduction + employee.esiDeduction + employee.professionalTax <= employee.monthlySalary, {
  path: ["professionalTax"],
});

function formText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

async function requirePeopleAdmin() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (!peopleAdmins.has(session.role)) redirect("/modules?access=denied");
  return session;
}

export async function createEmployee(formData: FormData) {
  const session = await requirePeopleAdmin();
  const parsed = employeeSchema.safeParse({
    schoolId: formData.get("schoolId"),
    name: formText(formData, "name"),
    email: formText(formData, "email").toLowerCase(),
    phone: formText(formData, "phone"),
    department: formText(formData, "department"),
    designation: formText(formData, "designation"),
    employmentType: formText(formData, "employmentType"),
    monthlySalary: formData.get("monthlySalary"),
    pfDeduction: formData.get("pfDeduction"),
    esiDeduction: formData.get("esiDeduction"),
    professionalTax: formData.get("professionalTax"),
    joinedOn: formText(formData, "joinedOn"),
  });
  if (!parsed.success) redirect("/staff?error=invalid");

  const database = getDb();
  const [school] = await database.select({ id: schools.id }).from(schools).where(and(
    eq(schools.id, parsed.data.schoolId),
    eq(schools.groupId, session.groupId),
  )).limit(1);
  if (!school) redirect("/staff?error=invalid-campus");

  try {
    await database.transaction(async (transaction) => {
      const [result] = await transaction.insert(employees).values({
        ...parsed.data,
        schoolId: school.id,
        employeeCode: `TMP-${randomUUID()}`,
        phone: parsed.data.phone || null,
      });
      const employeeId = Number(result.insertId);
      const employeeCode = `EMP-${new Date().getFullYear()}-${String(employeeId).padStart(3, "0")}`;
      await transaction.update(employees).set({ employeeCode }).where(eq(employees.id, employeeId));
    });
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") redirect("/staff?error=duplicate-id");
    throw error;
  }

  revalidatePath("/staff");
  redirect("/staff?created=1");
}

export async function recordEmployeeAttendance(formData: FormData) {
  const session = await requirePeopleAdmin();
  const parsed = z.object({
    employeeId: z.coerce.number().int().positive(),
    attendanceDate: z.iso.date(),
    status: z.enum(["present", "absent", "late", "half_day"]),
    checkIn: z.string().max(8),
    checkOut: z.string().max(8),
  }).safeParse({
    employeeId: formData.get("employeeId"),
    attendanceDate: formText(formData, "attendanceDate"),
    status: formText(formData, "status"),
    checkIn: formText(formData, "checkIn"),
    checkOut: formText(formData, "checkOut"),
  });
  if (!parsed.success || parsed.data.attendanceDate !== new Date().toISOString().slice(0, 10)) redirect("/staff?error=invalid-attendance");

  const [employee] = await getDb().select({ id: employees.id }).from(employees)
    .innerJoin(schools, eq(employees.schoolId, schools.id))
    .where(and(eq(employees.id, parsed.data.employeeId), eq(schools.groupId, session.groupId))).limit(1);
  if (!employee) redirect("/staff?error=invalid-employee");

  await getDb().insert(employeeAttendance).values({
    employeeId: employee.id,
    attendanceDate: parsed.data.attendanceDate,
    status: parsed.data.status,
    checkIn: parsed.data.checkIn || null,
    checkOut: parsed.data.checkOut || null,
    recordedBy: session.id,
  }).onDuplicateKeyUpdate({ set: {
    status: parsed.data.status,
    checkIn: parsed.data.checkIn || null,
    checkOut: parsed.data.checkOut || null,
    recordedBy: session.id,
  } });

  revalidatePath("/staff");
  redirect("/staff?attendance=1");
}

export async function createLeaveRequest(formData: FormData) {
  const session = await requirePeopleAdmin();
  const parsed = z.object({
    employeeId: z.coerce.number().int().positive(),
    leaveType: z.enum(["casual", "sick", "unpaid"]),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    reason: z.string().trim().min(1).max(500),
  }).safeParse({
    employeeId: formData.get("employeeId"),
    leaveType: formText(formData, "leaveType"),
    startDate: formText(formData, "startDate"),
    endDate: formText(formData, "endDate"),
    reason: formText(formData, "reason"),
  });
  if (!parsed.success || parsed.data.endDate < parsed.data.startDate) redirect("/staff?error=invalid-leave");

  const [employee] = await getDb().select({ id: employees.id }).from(employees)
    .innerJoin(schools, eq(employees.schoolId, schools.id))
    .where(and(eq(employees.id, parsed.data.employeeId), eq(schools.groupId, session.groupId))).limit(1);
  if (!employee) redirect("/staff?error=invalid-employee");

  await getDb().insert(leaveRequests).values({ ...parsed.data, employeeId: employee.id });
  revalidatePath("/staff");
  redirect("/staff?leave=created");
}

export async function reviewLeaveRequest(formData: FormData) {
  const session = await requirePeopleAdmin();
  const requestId = z.coerce.number().int().positive().safeParse(formData.get("requestId"));
  const decision = z.enum(["approved", "rejected"]).safeParse(formData.get("decision"));
  if (!requestId.success || !decision.success) redirect("/staff?error=invalid-leave");

  const [request] = await getDb().select({ id: leaveRequests.id }).from(leaveRequests)
    .innerJoin(employees, eq(leaveRequests.employeeId, employees.id))
    .innerJoin(schools, eq(employees.schoolId, schools.id))
    .where(and(eq(leaveRequests.id, requestId.data), eq(schools.groupId, session.groupId), eq(leaveRequests.status, "pending"))).limit(1);
  if (!request) redirect("/staff?error=invalid-leave");

  await getDb().update(leaveRequests).set({ status: decision.data, reviewedBy: session.id }).where(eq(leaveRequests.id, request.id));
  revalidatePath("/staff");
  redirect("/staff?leave=reviewed");
}

export async function generatePayroll(formData: FormData) {
  const session = await requirePeopleAdmin();
  if (!managers.has(session.role)) redirect("/modules?access=denied");
  const parsedPeriod = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).safeParse(formText(formData, "period"));
  if (!parsedPeriod.success) redirect("/staff?error=invalid-period");

  try {
    await getDb().transaction(async (transaction) => {
      const activeEmployees = await transaction.select({
        id: employees.id,
        monthlySalary: employees.monthlySalary,
        pfDeduction: employees.pfDeduction,
        esiDeduction: employees.esiDeduction,
        professionalTax: employees.professionalTax,
      })
        .from(employees).innerJoin(schools, eq(employees.schoolId, schools.id))
        .where(and(eq(schools.groupId, session.groupId), eq(employees.status, "active")));
      if (!activeEmployees.length) redirect("/staff?error=no-employees");
      await transaction.insert(payrollEntries).values(activeEmployees.map((employee) => {
        const deductions = employee.pfDeduction + employee.esiDeduction + employee.professionalTax;
        if (deductions > employee.monthlySalary) throw new Error("Configured deductions exceed an employee's monthly salary.");
        return {
          employeeId: employee.id,
          period: parsedPeriod.data,
          grossPay: employee.monthlySalary,
          deductions,
          netPay: employee.monthlySalary - deductions,
        };
      }));
    });
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") redirect("/staff?error=payroll-exists");
    throw error;
  }

  revalidatePath("/staff");
  redirect("/staff?payroll=generated");
}

export async function markPayrollPaid(formData: FormData) {
  const session = await requirePeopleAdmin();
  if (!managers.has(session.role)) redirect("/modules?access=denied");
  const entryId = z.coerce.number().int().positive().safeParse(formData.get("entryId"));
  if (!entryId.success) redirect("/staff?error=invalid-payroll");

  const [entry] = await getDb().select({ id: payrollEntries.id }).from(payrollEntries)
    .innerJoin(employees, eq(payrollEntries.employeeId, employees.id))
    .innerJoin(schools, eq(employees.schoolId, schools.id))
    .where(and(eq(payrollEntries.id, entryId.data), eq(schools.groupId, session.groupId), eq(payrollEntries.status, "draft"))).limit(1);
  if (!entry) redirect("/staff?error=invalid-payroll");

  await getDb().update(payrollEntries).set({ status: "paid", paidAt: new Date() }).where(eq(payrollEntries.id, entry.id));
  revalidatePath("/staff");
  redirect("/staff?payroll=paid");
}

export async function setEmployeeStatus(formData: FormData) {
  const session = await requirePeopleAdmin();
  const employeeId = z.coerce.number().int().positive().safeParse(formData.get("employeeId"));
  const status = z.enum(["active", "inactive"]).safeParse(formData.get("status"));
  if (!employeeId.success || !status.success) redirect("/staff?error=invalid-employee");

  const [employee] = await getDb().select({ id: employees.id }).from(employees)
    .innerJoin(schools, eq(employees.schoolId, schools.id))
    .where(and(eq(employees.id, employeeId.data), eq(schools.groupId, session.groupId))).limit(1);
  if (!employee) redirect("/staff?error=invalid-employee");

  await getDb().update(employees).set({ status: status.data }).where(eq(employees.id, employee.id));
  revalidatePath("/staff");
  redirect("/staff?employee=updated");
}