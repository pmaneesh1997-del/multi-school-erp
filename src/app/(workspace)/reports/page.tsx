import { ModuleWorkspace } from "@/components/module-workspace";
import { FeatureAccessBoundary } from "@/components/feature-access-boundary";

export default function ReportsPage() {
  return <FeatureAccessBoundary featureId="reports"><ModuleWorkspace module="reports" /></FeatureAccessBoundary>;
}
