'use client';

import { useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { createStudent } from "@/app/actions/students";

type CampusOption = { id: number; name: string };
type StudentRecord = {
  id: number;
  studentNumber: string;
  firstName: string;
  lastName: string;
  grade: string;
  section: string;
  status: string;
  schoolName: string;
};

export function StudentWorkspace({ campuses, students, notice }: { campuses: CampusOption[]; students: StudentRecord[]; notice?: string }) {
  const [isFormOpen, setIsFormOpen] = useState(notice === "invalid" || notice === "invalid-campus" || notice === "duplicate-id");
  const [query, setQuery] = useState("");
  const filteredStudents = students.filter((student) =>
    `${student.firstName} ${student.lastName} ${student.studentNumber} ${student.grade} ${student.section} ${student.schoolName}`.toLowerCase().includes(query.toLowerCase()),
  );
  const noticeMessage = notice === "created"
    ? "Student added to the school records."
    : notice === "duplicate-id"
      ? "That student ID already exists for this campus."
      : notice === "invalid-campus"
        ? "Choose a campus that belongs to your school group."
        : notice === "invalid"
          ? "Check the required fields and try again."
          : null;

  return (
    <>
      <div className="student-action-row">
        <button className="primary-button" type="button" onClick={() => setIsFormOpen((open) => !open)}>
          {isFormOpen ? <X size={16} /> : <Plus size={16} />}{isFormOpen ? "Close form" : "Add student"}
        </button>
      </div>
      {noticeMessage && <p className={`student-form-notice ${notice === "created" ? "notice-success" : "notice-error"}`} role="status">{noticeMessage}</p>}

      {isFormOpen && <section className="student-create-panel" aria-labelledby="student-create-title">
        <div className="student-create-heading"><div><span className="section-index">NEW RECORD</span><h2 id="student-create-title">Add a student</h2><p>Enter enrolment details and select the student&apos;s campus.</p></div></div>
        {campuses.length === 0
          ? <p className="student-form-notice notice-error">No campus exists in your school group yet. Add a campus before enrolling students.</p>
          : <form action={createStudent} className="student-create-form">
            <label>Student ID<input name="studentNumber" required maxLength={40} placeholder="STU-2026-001" /></label>
            <label>First name<input name="firstName" required maxLength={100} autoComplete="given-name" placeholder="First name" /></label>
            <label>Last name<input name="lastName" required maxLength={100} autoComplete="family-name" placeholder="Last name" /></label>
            <label>Grade<input name="grade" required maxLength={40} placeholder="Grade 6" /></label>
            <label>Section<input name="section" required maxLength={40} placeholder="A" /></label>
            <label>Campus<select name="schoolId" required defaultValue=""><option value="" disabled>Select campus</option>{campuses.map((campus) => <option value={campus.id} key={campus.id}>{campus.name}</option>)}</select></label>
            <div className="student-form-actions"><button className="primary-button" type="submit">Save student</button></div>
          </form>}
      </section>}

      <section className="panel module-table-panel">
        <div className="panel-heading module-panel-heading">
          <div><h2>Student directory</h2><p>Enrolled records in your school group</p></div>
          <span className="directory-count">{students.length} students</span>
        </div>
        <div className="module-table-toolbar student-directory-toolbar">
          <label className="module-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search students..." aria-label="Search students" /></label>
        </div>
        <div className="student-table-wrap module-table-wrap"><table className="student-table module-table"><thead><tr><th>STUDENT</th><th>STUDENT ID</th><th>GRADE &amp; SECTION</th><th>CAMPUS</th><th>STATUS</th></tr></thead><tbody>
          {filteredStudents.map((student) => <tr key={student.id}>
            <td><div className="module-primary-cell"><span className="module-row-avatar module-avatar-good">{student.firstName[0]}{student.lastName[0]}</span><strong>{student.firstName} {student.lastName}</strong></div></td>
            <td className="student-id">{student.studentNumber}</td><td>{student.grade} · {student.section}</td><td>{student.schoolName}</td>
            <td><span className="status-badge status-active"><i />{student.status}</span></td>
          </tr>)}
          {!filteredStudents.length && <tr><td className="module-no-results" colSpan={5}>{query ? "No matching students. Try another search." : "No students have been added yet."}</td></tr>}
        </tbody></table></div>
        <div className="table-footer module-table-footer"><span>Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students</span></div>
      </section>
      <p className="module-data-note">Student records are saved to the selected campus and scoped to your school group.</p>
    </>
  );
}
