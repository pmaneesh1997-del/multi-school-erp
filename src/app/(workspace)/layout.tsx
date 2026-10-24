import { Suspense } from "react";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ErpWorkspaceShell } from "@/components/erp-workspace-shell";

export const instant = false;

export default function WorkspaceLayout({ children }: LayoutProps<"/">) {
  return <Suspense fallback={<div className="page-loading">Loading your school workspace...</div>}><AuthenticatedWorkspace>{children}</AuthenticatedWorkspace></Suspense>;
}

async function AuthenticatedWorkspace({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  return <ErpWorkspaceShell userName={session.name} userRole={session.role}>{children}</ErpWorkspaceShell>;
}
