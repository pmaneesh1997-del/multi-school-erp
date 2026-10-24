import { ModuleWorkspace } from "@/components/module-workspace";
import { FeatureAccessBoundary } from "@/components/feature-access-boundary";

export default function AcademicsPage() {
  return <FeatureAccessBoundary featureId="academics"><ModuleWorkspace module="academics" /></FeatureAccessBoundary>;
}
