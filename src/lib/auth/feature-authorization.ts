import "server-only";

import { redirect } from "next/navigation";
import { canAccessFeature, type FeatureId } from "@/lib/auth/feature-access";
import { getSession } from "@/lib/auth/session";

export async function requireFeatureAccess(featureId: FeatureId) {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (!canAccessFeature(session.role, featureId)) redirect("/modules?access=denied");
  return session;
}