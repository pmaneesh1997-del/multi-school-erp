import { Suspense } from "react";
import { ModuleDirectory } from "@/components/module-directory";
import { requireFeatureAccess } from "@/lib/auth/feature-authorization";

export default function ModulesPage() {
  return <Suspense fallback={<div className="page-loading">Loading your school workspace...</div>}><ModulesContent /></Suspense>;
}

async function ModulesContent() {
  const session = await requireFeatureAccess("overview");
  return <ModuleDirectory role={session.role} />;
}