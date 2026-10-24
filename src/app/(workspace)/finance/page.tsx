import { ModuleWorkspace } from "@/components/module-workspace";
import { FeatureAccessBoundary } from "@/components/feature-access-boundary";

export default function FinancePage() {
  return <FeatureAccessBoundary featureId="finance"><ModuleWorkspace module="finance" /></FeatureAccessBoundary>;
}
