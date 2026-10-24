import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FeatureWorkspace } from "@/components/feature-workspace";
import { features, type FeatureId } from "@/lib/auth/feature-access";
import { requireFeatureAccess } from "@/lib/auth/feature-authorization";

export default function FeaturePage({ params }: { params: Promise<{ featureId: string }> }) {
  return <Suspense fallback={<div className="page-loading">Loading feature workspace...</div>}><FeaturePageContent params={params} /></Suspense>;
}

async function FeaturePageContent({ params }: { params: Promise<{ featureId: string }> }) {
  const { featureId } = await params;
  const feature = features.find((item) => item.id === featureId);
  if (!feature || feature.id === "overview") notFound();

  await requireFeatureAccess(feature.id as FeatureId);
  return <FeatureWorkspace feature={feature} />;
}
