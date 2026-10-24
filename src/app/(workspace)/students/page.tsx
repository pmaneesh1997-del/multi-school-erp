import { Suspense } from "react";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { StudentWorkspace } from "@/components/student-workspace";
import { requireFeatureAccess } from "@/lib/auth/feature-authorization";
import { getDb } from "@/lib/db";
import { schools, students } from "@/lib/db/schema";

export default function StudentsPage({ searchParams }: { searchParams: Promise<{ created?: string; error?: string }> }) {
  return <Suspense fallback={<div className="page-loading">Loading student records...</div>}><StudentsContent searchParams={searchParams} /></Suspense>;
}

async function StudentsContent({ searchParams }: { searchParams: Promise<{ created?: string; error?: string }> }) {
  const session = await requireFeatureAccess("students");
  if (!["platform_admin", "group_owner", "group_admin", "school_admin", "teacher"].includes(session.role)) {
    redirect("/modules?access=denied");
  }

  const [{ created, error }, campusRows, studentRows] = await Promise.all([
    searchParams,
    getDb().select({ id: schools.id, name: schools.name }).from(schools).where(eq(schools.groupId, session.groupId)).orderBy(schools.name),
    getDb().select({
      id: students.id,
      studentNumber: students.studentNumber,
      firstName: students.firstName,
      lastName: students.lastName,
      grade: students.grade,
      section: students.section,
      status: students.status,
      schoolName: schools.name,
    }).from(students).innerJoin(schools, eq(students.schoolId, schools.id)).where(eq(schools.groupId, session.groupId)).orderBy(desc(students.createdAt)),
  ]);

  return <StudentWorkspace campuses={campusRows} students={studentRows} notice={created ? "created" : error} />;
}
