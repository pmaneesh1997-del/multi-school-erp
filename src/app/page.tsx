import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DashboardOverview } from "@/components/dashboard-overview";
import { ErpWorkspaceShell } from "@/components/erp-workspace-shell";
import { getSession } from "@/lib/auth/session";

export default function Home() {
  return <Suspense fallback={<div className="page-loading">Loading your school workspace...</div>}><Dashboard /></Suspense>;
}

async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  return <ErpWorkspaceShell userName={session.name} userRole={session.role}><DashboardOverview userName={session.name} userRole={session.role} /></ErpWorkspaceShell>;
}
