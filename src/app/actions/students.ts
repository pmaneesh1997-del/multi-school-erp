'use server';

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { schools, students } from "@/lib/db/schema";

const studentSchema = z.object({
  studentNumber: z.string().trim().min(1).max(40),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  grade: z.string().trim().min(1).max(40),
  section: z.string().trim().min(1).max(40),
  schoolId: z.coerce.number().int().positive(),
});

const studentCreationRoles = new Set(["platform_admin", "group_owner", "group_admin", "school_admin"]);

export async function createStudent(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (!studentCreationRoles.has(session.role)) redirect("/modules?access=denied");

  const parsed = studentSchema.safeParse({
    studentNumber: formData.get("studentNumber"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    grade: formData.get("grade"),
    section: formData.get("section"),
    schoolId: formData.get("schoolId"),
  });
  if (!parsed.success) redirect("/students?error=invalid");

  const database = getDb();
  const [school] = await database.select({ id: schools.id }).from(schools).where(and(
    eq(schools.id, parsed.data.schoolId),
    eq(schools.groupId, session.groupId),
  )).limit(1);
  if (!school) redirect("/students?error=invalid-campus");

  try {
    await database.insert(students).values({
      schoolId: school.id,
      studentNumber: parsed.data.studentNumber,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      grade: parsed.data.grade,
      section: parsed.data.section,
      status: "active",
    });
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") redirect("/students?error=duplicate-id");
    throw error;
  }

  revalidatePath("/students");
  redirect("/students?created=1");
}
