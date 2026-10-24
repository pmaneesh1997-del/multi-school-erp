import { Suspense } from "react";
import { and, desc, eq } from "drizzle-orm";
import { StaffWorkspace } from "@/components/staff-workspace";
import { requireFeatureAccess } from "@/lib/auth/feature-authorization";
import { getDb } from "@/lib/db";
import { employeeAttendance, employees, leaveRequests, payrollEntries, schools } from "@/lib/db/schema";

export default function StaffPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <Suspense fallback={<div className="page-loading">Loading staff and HR records...</div>}><StaffContent searchParams={searchParams} /></Suspense>;
}

async function StaffContent({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireFeatureAccess("staff");
  const today = new Date().toISOString().slice(0, 10);
  const period = today.slice(0, 7);
  const [{ created, error, attendance, leave, payroll, employee }, campusRows, employeeRows, attendanceRows, leaveRows, payrollRows] = await Promise.all([
    searchParams,
    getDb().select({ id: schools.id, name: schools.name }).from(schools).where(eq(schools.groupId, session.groupId)).orderBy(schools.name),
    getDb().select({
      id: employees.id,
      employeeCode: employees.employeeCode,
      name: employees.name,
      email: employees.email,
      phone: employees.phone,
      department: employees.department,
      designation: employees.designation,
      employmentType: employees.employmentType,
      monthlySalary: employees.monthlySalary,
      status: employees.status,
      joinedOn: employees.joinedOn,
      schoolId: employees.schoolId,
      schoolName: schools.name,
    }).from(employees).innerJoin(schools, eq(employees.schoolId, schools.id)).where(eq(schools.groupId, session.groupId)).orderBy(desc(employees.createdAt)),
    getDb().select({
      id: employeeAttendance.id,
      employeeId: employees.id,
      employeeName: employees.name,
      employeeCode: employees.employeeCode,
      status: employeeAttendance.status,
      checkIn: employeeAttendance.checkIn,
      checkOut: employeeAttendance.checkOut,
    }).from(employeeAttendance).innerJoin(employees, eq(employeeAttendance.employeeId, employees.id))
      .innerJoin(schools, eq(employees.schoolId, schools.id))
      .where(and(eq(schools.groupId, session.groupId), eq(employeeAttendance.attendanceDate, today))).orderBy(employees.name),
    getDb().select({
      id: leaveRequests.id,
      employeeId: employees.id,
      employeeName: employees.name,
      employeeCode: employees.employeeCode,
      leaveType: leaveRequests.leaveType,
      startDate: leaveRequests.startDate,
      endDate: leaveRequests.endDate,
      reason: leaveRequests.reason,
      status: leaveRequests.status,
    }).from(leaveRequests).innerJoin(employees, eq(leaveRequests.employeeId, employees.id))
      .innerJoin(schools, eq(employees.schoolId, schools.id))
      .where(eq(schools.groupId, session.groupId)).orderBy(desc(leaveRequests.createdAt)),
    getDb().select({
      id: payrollEntries.id,
      employeeName: employees.name,
      employeeCode: employees.employeeCode,
      department: employees.department,
      period: payrollEntries.period,
      grossPay: payrollEntries.grossPay,
      deductions: payrollEntries.deductions,
      netPay: payrollEntries.netPay,
      status: payrollEntries.status,
    }).from(payrollEntries).innerJoin(employees, eq(payrollEntries.employeeId, employees.id))
      .innerJoin(schools, eq(employees.schoolId, schools.id))
      .where(and(eq(schools.groupId, session.groupId), eq(payrollEntries.period, period))).orderBy(employees.name),
  ]);

  const notice = created ? "created"
    : attendance ? "attendance"
      : employee ? "employee"
      : leave ? "leave"
        : payroll ? "payroll"
          : Array.isArray(error) ? error[0] : error;

  return <div className="dashboard-content module-content">
    <div className="module-page-heading">
      <div><div className="eyebrow"><span className="live-dot" /> PEOPLE &amp; ORGANISATION</div><h1>Staff &amp; HR</h1><p className="welcome-subtitle">Employee records, attendance, leave and monthly payroll for your school group.</p></div>
    </div>
    <StaffWorkspace
      campuses={campusRows}
      employees={employeeRows}
      attendance={attendanceRows}
      leaves={leaveRows}
      payroll={payrollRows}
      today={today}
      period={period}
      notice={notice}
      canManagePayroll={["platform_admin", "group_owner", "group_admin", "school_admin"].includes(session.role)}
    />
  </div>;
}