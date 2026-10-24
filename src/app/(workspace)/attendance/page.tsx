import { ModuleWorkspace } from "@/components/module-workspace";
import { FeatureAccessBoundary } from "@/components/feature-access-boundary";

export default function AttendancePage() {
  return <FeatureAccessBoundary featureId="attendance"><ModuleWorkspace module="attendance" /></FeatureAccessBoundary>;
}
