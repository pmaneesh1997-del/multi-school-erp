'use server';

import "server-only";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { schoolGroups, schools, users } from "@/lib/db/schema";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const campusSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().toLowerCase().min(2).max(100).regex(slugPattern),
  timezone: z.string().trim().min(1).max(64),
  groupId: z.coerce.number().int().positive().optional(),
});
const groupSchema = z.object({
  groupName: z.string().trim().min(2).max(160),
  groupSlug: z.string().trim().toLowerCase().min(2).max(100).regex(slugPattern),
  campusName: z.string().trim().min(2).max(160),
  campusSlug: z.string().trim().toLowerCase().min(2).max(100).regex(slugPattern),
  timezone: z.string().trim().min(1).max(64),
  ownerName: z.string().trim().min(2).max(160),
  ownerEmail: z.email().max(254),
  ownerPassword: z.string().min(12).max(128),
});

const campusAdminRoles = new Set(["platform_admin", "group_owner", "group_admin", "school_admin"]);

export async function createCampus(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (!campusAdminRoles.has(session.role)) redirect("/modules?access=denied");

  const parsed = campusSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    timezone: formData.get("timezone"),
    groupId: formData.get("groupId") || undefined,
  });
  if (!parsed.success) redirect("/settings?campusError=invalid");

  const groupId = session.role === "platform_admin" ? parsed.data.groupId : session.groupId;
  if (!groupId) redirect("/settings?campusError=invalid");

  const database = getDb();
  const [group] = await database.select({ id: schoolGroups.id }).from(schoolGroups).where(eq(schoolGroups.id, groupId)).limit(1);
  if (!group || (session.role !== "platform_admin" && group.id !== session.groupId)) {
    redirect("/settings?campusError=invalid");
  }

  try {
    await database.insert(schools).values({
      groupId: group.id,
      name: parsed.data.name,
      slug: parsed.data.slug,
      timezone: parsed.data.timezone,
    });
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") redirect("/settings?campusError=duplicate");
    throw error;
  }

  revalidatePath("/settings");
  redirect("/settings?campusCreated=1");
}

export async function createSchoolGroup(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "platform_admin") redirect("/modules?access=denied");

  const parsed = groupSchema.safeParse({
    groupName: formData.get("groupName"),
    groupSlug: formData.get("groupSlug"),
    campusName: formData.get("campusName"),
    campusSlug: formData.get("campusSlug"),
    timezone: formData.get("timezone"),
    ownerName: formData.get("ownerName"),
    ownerEmail: String(formData.get("ownerEmail") ?? "").trim().toLowerCase(),
    ownerPassword: formData.get("ownerPassword"),
  });
  if (!parsed.success) redirect("/settings?groupError=invalid");

  const passwordHash = await hash(parsed.data.ownerPassword, 12);
  const database = getDb();

  try {
    await database.transaction(async (transaction) => {
      await transaction.insert(schoolGroups).values({ name: parsed.data.groupName, slug: parsed.data.groupSlug });
      const [group] = await transaction.select({ id: schoolGroups.id }).from(schoolGroups).where(eq(schoolGroups.slug, parsed.data.groupSlug)).limit(1);
      if (!group) throw new Error("Could not load the created school group.");

      await transaction.insert(schools).values({
        groupId: group.id,
        name: parsed.data.campusName,
        slug: parsed.data.campusSlug,
        timezone: parsed.data.timezone,
      });
      const [campus] = await transaction.select({ id: schools.id }).from(schools).where(eq(schools.groupId, group.id)).limit(1);
      if (!campus) throw new Error("Could not load the initial campus.");

      await transaction.insert(users).values({
        groupId: group.id,
        schoolId: campus.id,
        name: parsed.data.ownerName,
        email: parsed.data.ownerEmail,
        passwordHash,
        role: "group_owner",
      });
    });
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") redirect("/settings?groupError=duplicate");
    throw error;
  }

  revalidatePath("/settings");
  redirect("/settings?groupCreated=1");
}
