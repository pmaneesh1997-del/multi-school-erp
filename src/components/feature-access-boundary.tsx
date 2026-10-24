import { Suspense } from "react";
import type { ReactNode } from "react";
import type { FeatureId } from "@/lib/auth/feature-access";
import { requireFeatureAccess } from "@/lib/auth/feature-authorization";

export function FeatureAccessBoundary({ featureId, children }: { featureId: FeatureId; children: ReactNode }) {
  return <Suspense fallback={<div className="page-loading">Loading your school workspace...</div>}><AuthorizedFeature featureId={featureId}>{children}</AuthorizedFeature></Suspense>;
}

async function AuthorizedFeature({ featureId, children }: { featureId: FeatureId; children: ReactNode }) {
  await requireFeatureAccess(featureId);
  return children;
}
