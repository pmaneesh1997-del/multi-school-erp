import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { SchoolManagement } from "@/components/school-management";
import { requireFeatureAccess } from "@/lib/auth/feature-authorization";
import { getDb } from "@/lib/db";
import { schoolGroups, schools } from "@/lib/db/schema";

export default function SettingsPage({ searchParams }: { searchParams: Promise<{ campusCreated?: string; campusError?: string; groupCreated?: string; groupError?: string }> }) {
  return <Suspense fallback={<div className="page-loading">Loading school settings...</div>}><SettingsContent searchParams={searchParams} /></Suspense>;
}

async function SettingsContent({ searchParams }: { searchParams: Promise<{ campusCreated?: string; campusError?: string; groupCreated?: string; groupError?: string }> }) {
  const session = await requireFeatureAccess("settings");
  const [{ campusCreated, campusError, groupCreated, groupError }, groups, campusRows] = await Promise.all([
    searchParams,
    session.role === "platform_admin"
      ? getDb().select({ id: schoolGroups.id, name: schoolGroups.name, slug: schoolGroups.slug }).from(schoolGroups).orderBy(schoolGroups.name)
      : getDb().select({ id: schoolGroups.id, name: schoolGroups.name, slug: schoolGroups.slug }).from(schoolGroups).where(eq(schoolGroups.id, session.groupId)).limit(1),
    session.role === "platform_admin"
      ? getDb().select({ id: schools.id, name: schools.name, slug: schools.slug, timezone: schools.timezone, groupName: schoolGroups.name }).from(schools).innerJoin(schoolGroups, eq(schools.groupId, schoolGroups.id)).orderBy(schoolGroups.name, schools.name)
      : getDb().select({ id: schools.id, name: schools.name, slug: schools.slug, timezone: schools.timezone, groupName: schoolGroups.name }).from(schools).innerJoin(schoolGroups, eq(schools.groupId, schoolGroups.id)).where(eq(schools.groupId, session.groupId)).orderBy(schools.name),
  ]);

  return <SchoolManagement role={session.role} groups={groups} campuses={campusRows} notices={{ campusCreated, campusError, groupCreated, groupError }} />;
}
