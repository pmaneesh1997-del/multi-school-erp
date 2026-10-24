'use client';

import { useState } from "react";
import { CalendarCheck2, Check, CircleDollarSign, Clock3, Plus, Search, UsersRound, X } from "lucide-react";
import {
  createEmployee,
  createLeaveRequest,
  generatePayroll,
  markPayrollPaid,
  recordEmployeeAttendance,
  reviewLeaveRequest,
  setEmployeeStatus,
} from "@/app/actions/staff";

type Campus = { id: number; name: string };
type Employee = {
  id: number;
  employeeCode: string;
  name: string;
  email: string;
  phone: string | null;
  department: string;
  designation: string;
  employmentType: string;
  monthlySalary: number;
  status: string;
  joinedOn: string;
  schoolId: number;
  schoolName: string;
};
type Attendance = { id: number; employeeId: number; employeeName: string; employeeCode: string; status: string; checkIn: string | null; checkOut: string | null };
type Leave = { id: number; employeeId: number; employeeName: string; employeeCode: string; leaveType: string; startDate: string; endDate: string; reason: string; status: string };
type Payroll = { id: number; employeeName: string; employeeCode: string; department: string; period: string; grossPay: number; deductions: number; netPay: number; status: string };

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const dateLabel = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function StaffWorkspace({
  campuses,
  employees,
  attendance,
  leaves,
  payroll,
  today,
  period,
  notice,
  canManagePayroll,
}: {
  campuses: Campus[];
  employees: Employee[];
  attendance: Attendance[];
  leaves: Leave[];
  payroll: Payroll[];
  today: string;
  period: string;
  notice?: string;
  canManagePayroll: boolean;
}) {
  const [tab, setTab] = useState("Directory");
  const [query, setQuery] = useState("");
  const [employeeFormOpen, setEmployeeFormOpen] = useState(notice === "invalid" || notice === "invalid-campus" || notice === "duplicate-id");
  const [leaveFormOpen, setLeaveFormOpen] = useState(notice === "invalid-leave");
  const activeEmployees = employees.filter((employee) => employee.status === "active");
  const filteredEmployees = employees.filter((employee) =>
    `${employee.name} ${employee.employeeCode} ${employee.department} ${employee.designation} ${employee.schoolName}`.toLowerCase().includes(query.toLowerCase()),
  );
  const pendingLeaves = leaves.filter((leave) => leave.status === "pending").length;
  const attendancePercent = activeEmployees.length ? Math.round((attendance.filter((record) => ["present", "late"].includes(record.status)).length / activeEmployees.length) * 100) : 0;
  const noticeCopy: Record<string, string> = {
    created: "Employee record saved.",
    "duplicate-id": "This employee ID already exists at that campus.",
    "invalid-campus": "Choose a campus from your school group.",
    invalid: "Check the required employee details and try again.",
    attendance: "Today's attendance was saved.",
    employee: "Employee status updated.",
    "invalid-attendance": "Attendance date or status is invalid.",
    "invalid-employee": "That employee is not available in your school group.",
    "invalid-leave": "Leave request could not be saved or reviewed.",
    "invalid-period": "Choose a valid payroll month.",
    "no-employees": "There are no active employees to include in payroll.",
    "payroll-exists": "Payroll already exists for this month. Duplicate generation was stopped.",
    "invalid-payroll": "That payroll entry is no longer available to update.",
  };
  const successNotice = ["created", "attendance", "employee", "leave", "payroll"].includes(notice ?? "");

  return <div className="staff-workspace">
    <section className="staff-summary" aria-label="HR summary">
      <article><span className="staff-summary-icon staff-summary-green"><UsersRound size={17} /></span><span><small>Active employees</small><strong>{activeEmployees.length}</strong><em>{employees.length} total records</em></span></article>
      <article><span className="staff-summary-icon staff-summary-blue"><CalendarCheck2 size={17} /></span><span><small>Attendance today</small><strong>{attendancePercent}%</strong><em>{attendance.length} marks recorded</em></span></article>
      <article><span className="staff-summary-icon staff-summary-gold"><Clock3 size={17} /></span><span><small>Pending leave</small><strong>{pendingLeaves}</strong><em>Request review queue</em></span></article>
      <article><span className="staff-summary-icon staff-summary-coral"><CircleDollarSign size={17} /></span><span><small>Payroll this month</small><strong>{payroll.length}</strong><em>{period} pay entries</em></span></article>
    </section>

    {noticeCopy[notice ?? ""] && <p className={`student-form-notice ${successNotice ? "notice-success" : "notice-error"}`} role="status">{noticeCopy[notice ?? ""]}</p>}

    <section className="panel staff-panel">
      <div className="staff-toolbar">
        <div className="staff-tabs" role="tablist" aria-label="HR sections">
          {["Directory", "Attendance & leave", "Payroll"].map((item) => <button type="button" key={item} role="tab" aria-selected={tab === item} className={tab === item ? "staff-tab staff-tab-active" : "staff-tab"} onClick={() => setTab(item)}>{item}{item === "Attendance & leave" && pendingLeaves > 0 && <span>{pendingLeaves}</span>}</button>)}
        </div>
        <label className="module-search staff-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search staff..." aria-label="Search staff" /></label>
      </div>

      {tab === "Directory" && <>
        <div className="panel-heading module-panel-heading staff-heading">
          <div><h2>Employee directory</h2><p>Employee records, campus, role and monthly compensation</p></div>
          <button className="primary-button" type="button" onClick={() => setEmployeeFormOpen((open) => !open)}>{employeeFormOpen ? <X size={15} /> : <Plus size={15} />}{employeeFormOpen ? "Close" : "Add employee"}</button>
        </div>
        {employeeFormOpen && <form action={createEmployee} className="staff-form">
          <p className="staff-id-hint">Employee ID is generated automatically when the record is saved (for example, EMP-2026-001).</p>
          <label>Full name<input name="name" required maxLength={160} autoComplete="name" /></label>
          <label>Work email<input name="email" required type="email" maxLength={254} autoComplete="email" /></label>
          <label>Phone<input name="phone" maxLength={24} autoComplete="tel" /></label>
          <label>Department<input name="department" required maxLength={100} placeholder="Teaching" /></label>
          <label>Designation<input name="designation" required maxLength={100} placeholder="Mathematics teacher" /></label>
          <label>Campus<select name="schoolId" required defaultValue=""><option value="" disabled>Select campus</option>{campuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.name}</option>)}</select></label>
          <label>Employment type<select name="employmentType" defaultValue="full_time"><option value="full_time">Full-time</option><option value="part_time">Part-time</option><option value="contract">Contract</option></select></label>
          <label>Monthly gross salary (INR)<input name="monthlySalary" type="number" min="0" max="100000000" step="1" required /></label>
          <label>PF deduction (INR)<input name="pfDeduction" type="number" min="0" max="100000000" step="1" defaultValue="0" required /></label>
          <label>ESI deduction (INR)<input name="esiDeduction" type="number" min="0" max="100000000" step="1" defaultValue="0" required /></label>
          <label>Professional tax (INR)<input name="professionalTax" type="number" min="0" max="100000000" step="1" defaultValue="0" required /></label>
          <label>Date joined<input name="joinedOn" type="date" required defaultValue={today} /></label>
          <div className="staff-form-actions"><button className="primary-button" type="submit">Save employee</button></div>
        </form>}
        {campuses.length === 0 && employeeFormOpen && <p className="staff-empty">Add a campus in Settings before adding employees.</p>}
        <div className="student-table-wrap module-table-wrap"><table className="student-table module-table staff-table"><thead><tr><th>EMPLOYEE</th><th>EMPLOYEE ID</th><th>ROLE &amp; DEPARTMENT</th><th>CAMPUS</th><th>MONTHLY GROSS</th><th>STATUS</th></tr></thead><tbody>
          {filteredEmployees.map((employee) => <tr key={employee.id}><td><div className="module-primary-cell"><span className="module-row-avatar module-avatar-good">{employee.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><span><strong>{employee.name}</strong><small>{employee.email}</small></span></div></td><td className="student-id">{employee.employeeCode}</td><td><strong className="staff-cell-main">{employee.designation}</strong><small className="staff-cell-sub">{employee.department} · {employee.employmentType.replace("_", " ")}</small></td><td>{employee.schoolName}</td><td>{inr.format(employee.monthlySalary)}</td><td><div className="staff-status-cell"><span className={`status-badge ${employee.status === "active" ? "status-active" : "status-pending"}`}><i />{employee.status}</span><form action={setEmployeeStatus}><input type="hidden" name="employeeId" value={employee.id} /><button className="staff-status-button" name="status" value={employee.status === "active" ? "inactive" : "active"} type="submit">{employee.status === "active" ? "Deactivate" : "Reactivate"}</button></form></div></td></tr>)}
          {!filteredEmployees.length && <tr><td colSpan={6} className="module-no-results">{query ? "No matching employees." : "No employee records yet. Add your first employee to begin."}</td></tr>}
        </tbody></table></div>
        <div className="table-footer module-table-footer"><span>Showing <strong>{filteredEmployees.length}</strong> of <strong>{employees.length}</strong> employees</span></div>
      </>}

      {tab === "Attendance & leave" && <div className="staff-section-content">
        <div className="staff-section-heading"><div><h2>Staff attendance</h2><p>{dateLabel(today)} · attendance can be corrected by recording the same employee and date again</p></div></div>
        {activeEmployees.length > 0 && <form action={recordEmployeeAttendance} className="staff-inline-form">
          <label>Employee<select name="employeeId" required defaultValue=""><option value="" disabled>Select employee</option>{activeEmployees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.employeeCode}</option>)}</select></label>
          <label>Date<input name="attendanceDate" type="date" required defaultValue={today} min={today} max={today} /></label>
          <label>Status<select name="status" defaultValue="present"><option value="present">Present</option><option value="late">Late</option><option value="half_day">Half day</option><option value="absent">Absent</option></select></label>
          <label>Check in<input name="checkIn" type="time" /></label>
          <label>Check out<input name="checkOut" type="time" /></label>
          <button className="primary-button" type="submit">Save attendance</button>
        </form>}
        <div className="student-table-wrap module-table-wrap"><table className="student-table module-table staff-table"><thead><tr><th>EMPLOYEE</th><th>EMPLOYEE ID</th><th>CHECK IN</th><th>CHECK OUT</th><th>ATTENDANCE</th></tr></thead><tbody>{attendance.map((record) => <tr key={record.id}><td><strong className="staff-cell-main">{record.employeeName}</strong></td><td className="student-id">{record.employeeCode}</td><td>{record.checkIn || "—"}</td><td>{record.checkOut || "—"}</td><td><span className={`status-badge ${record.status === "absent" ? "status-pending" : "status-active"}`}><i />{record.status.replace("_", " ")}</span></td></tr>)}{!attendance.length && <tr><td colSpan={5} className="module-no-results">No attendance recorded for this date.</td></tr>}</tbody></table></div>

        <div className="staff-section-heading staff-leave-heading"><div><h2>Leave requests</h2><p>Review requests and track approved or declined leave</p></div><button className="filter-button" type="button" onClick={() => setLeaveFormOpen((open) => !open)}>{leaveFormOpen ? <X size={14} /> : <Plus size={14} />}{leaveFormOpen ? "Close" : "New request"}</button></div>
        {leaveFormOpen && <form action={createLeaveRequest} className="staff-inline-form staff-leave-form">
          <label>Employee<select name="employeeId" required defaultValue=""><option value="" disabled>Select employee</option>{activeEmployees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.employeeCode}</option>)}</select></label>
          <label>Leave type<select name="leaveType" defaultValue="casual"><option value="casual">Casual</option><option value="sick">Sick</option><option value="unpaid">Unpaid</option></select></label>
          <label>From<input name="startDate" type="date" required /></label><label>To<input name="endDate" type="date" required /></label>
          <label className="staff-reason">Reason<input name="reason" required maxLength={500} /></label>
          <button className="primary-button" type="submit">Submit request</button>
        </form>}
        <div className="staff-leave-list">{leaves.map((leave) => <article className="staff-leave-row" key={leave.id}><span className="module-row-avatar module-avatar-blue">{leave.employeeName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div className="staff-leave-copy"><strong>{leave.employeeName} <small>{leave.employeeCode}</small></strong><span>{leave.leaveType} leave · {dateLabel(leave.startDate)} to {dateLabel(leave.endDate)}</span><small>{leave.reason}</small></div><span className={`status-badge ${leave.status === "approved" ? "status-active" : leave.status === "pending" ? "status-pending" : "status-inactive"}`}><i />{leave.status}</span>{leave.status === "pending" && <form action={reviewLeaveRequest} className="staff-review-actions"><input type="hidden" name="requestId" value={leave.id} /><button name="decision" value="approved" aria-label="Approve leave" title="Approve leave"><Check size={15} /></button><button name="decision" value="rejected" aria-label="Reject leave" title="Reject leave"><X size={15} /></button></form>}</article>)}{!leaves.length && <p className="staff-empty">No leave requests have been submitted.</p>}</div>
      </div>}

      {tab === "Payroll" && <div className="staff-section-content">
        <div className="staff-section-heading"><div><h2>Monthly payroll</h2><p>Gross pay less configured PF, ESI and professional-tax deductions</p></div></div>
        {canManagePayroll && <form action={generatePayroll} className="staff-payroll-run"><label>Payroll month<input name="period" type="month" required defaultValue={period} /></label><button className="primary-button" type="submit"><Plus size={15} />Generate payroll</button><small>Generation creates one draft per active employee. A month can only be generated once.</small></form>}
        <div className="student-table-wrap module-table-wrap"><table className="student-table module-table staff-table"><thead><tr><th>EMPLOYEE</th><th>PERIOD</th><th>GROSS PAY</th><th>DEDUCTIONS</th><th>NET PAY</th><th>STATUS</th>{canManagePayroll && <th>ACTION</th>}</tr></thead><tbody>{payroll.map((entry) => <tr key={entry.id}><td><strong className="staff-cell-main">{entry.employeeName}</strong><small className="staff-cell-sub">{entry.employeeCode} · {entry.department}</small></td><td>{entry.period}</td><td>{inr.format(entry.grossPay)}</td><td>{inr.format(entry.deductions)}</td><td><strong className="staff-cell-main">{inr.format(entry.netPay)}</strong></td><td><span className={`status-badge ${entry.status === "paid" ? "status-active" : "status-pending"}`}><i />{entry.status}</span></td>{canManagePayroll && <td>{entry.status === "draft" && <form action={markPayrollPaid}><input type="hidden" name="entryId" value={entry.id} /><button className="staff-paid-button" type="submit">Mark paid</button></form>}</td>}</tr>)}{!payroll.length && <tr><td colSpan={canManagePayroll ? 7 : 6} className="module-no-results">No payroll entries for {period}. Generate payroll after adding employees.</td></tr>}</tbody></table></div>
      </div>}
    </section>
    <p className="module-data-note">HR records are scoped to your school group. Payroll deductions use the amounts configured for each employee.</p>
  </div>;
}