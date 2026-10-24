export const roles = [
  "platform_admin",
  "group_owner",
  "group_admin",
  "school_admin",
  "teacher",
  "accountant",
  "hr_manager",
  "librarian",
  "transport_manager",
  "driver",
  "parent",
  "student",
] as const;

export type AppRole = (typeof roles)[number];
export type FeatureId =
  | "overview"
  | "students"
  | "staff"
  | "academics"
  | "attendance"
  | "finance"
  | "reports"
  | "billing"
  | "settings"
  | "ai-assistant"
  | "gps-tracking"
  | "biometric-attendance"
  | "parent-app"
  | "online-payments"
  | "exams-results"
  | "parent-communication"
  | "inventory-assets"
  | "library"
  | "transport"
  | "hostel"
  | "lms"
  | "certificates"
  | "languages"
  | "security"
  | "communication-hub";

export type FeatureCategory = "Workspace" | "School operations" | "Connected apps" | "Administration";

export type FeatureDefinition = {
  id: FeatureId;
  label: string;
  category: FeatureCategory;
  href: string;
  icon: string;
  summary: string;
  state: "Preview" | "Connected" | "Setup required";
  roles: readonly AppRole[];
  featured?: boolean;
};

const groupAdmins: readonly AppRole[] = ["platform_admin", "group_owner", "group_admin"];
const schoolAdmins: readonly AppRole[] = [...groupAdmins, "school_admin"];
const teachingRoles: readonly AppRole[] = [...schoolAdmins, "teacher"];
const peopleAdmins: readonly AppRole[] = [...schoolAdmins, "hr_manager"];
const financeRoles: readonly AppRole[] = [...schoolAdmins, "accountant"];
const studentFacingRoles: readonly AppRole[] = [...teachingRoles, "parent", "student"];

export const features: readonly FeatureDefinition[] = [
  { id: "overview", label: "Overview", category: "Workspace", href: "/", icon: "LayoutDashboard", summary: "School group activity and daily highlights.", state: "Preview", roles: [...schoolAdmins, "teacher", "accountant", "hr_manager", "librarian", "transport_manager", "driver", "parent", "student"], featured: true },
  { id: "students", label: "Student lifecycle", category: "Workspace", href: "/students", icon: "GraduationCap", summary: "Admissions, enrolment, student records, and alumni.", state: "Preview", roles: teachingRoles, featured: true },
  { id: "staff", label: "Staff & HR", category: "Workspace", href: "/staff", icon: "UsersRound", summary: "Staff directory, roles, leave, and payroll workflows.", state: "Preview", roles: peopleAdmins, featured: true },
  { id: "academics", label: "Academics & timetable", category: "Workspace", href: "/academics", icon: "BookOpenCheck", summary: "Classes, curriculum, assessments, and term schedules.", state: "Preview", roles: studentFacingRoles, featured: true },
  { id: "attendance", label: "Attendance", category: "Workspace", href: "/attendance", icon: "CalendarDays", summary: "Daily attendance registers and campus summaries.", state: "Preview", roles: [...teachingRoles, "accountant", "parent", "student"], featured: true },
  { id: "finance", label: "Fee collection", category: "Workspace", href: "/finance", icon: "CircleDollarSign", summary: "Fee plans, collections, dues, and receipts.", state: "Preview", roles: [...financeRoles, "parent"], featured: true },
  { id: "reports", label: "Reports & analytics", category: "School operations", href: "/reports", icon: "ChartNoAxesCombined", summary: "Attendance, enrolment, and finance report views.", state: "Preview", roles: [...schoolAdmins, "teacher", "accountant", "hr_manager"] },
  { id: "billing", label: "Billing & subscriptions", category: "Administration", href: "/billing", icon: "CreditCard", summary: "Manage the ERP subscription and billing history.", state: "Connected", roles: groupAdmins },
  { id: "settings", label: "Schools & campuses", category: "Administration", href: "/settings", icon: "Settings2", summary: "Create and manage school groups and campuses.", state: "Connected", roles: schoolAdmins },
  { id: "ai-assistant", label: "AI assistant", category: "Connected apps", href: "/features/ai-assistant", icon: "BrainCircuit", summary: "Ask questions about school operations and reports.", state: "Setup required", roles: schoolAdmins, featured: true },
  { id: "gps-tracking", label: "Live GPS tracking", category: "Connected apps", href: "/features/gps-tracking", icon: "MapPinned", summary: "Track school vehicles and route updates in real time.", state: "Setup required", roles: [...schoolAdmins, "transport_manager", "driver", "parent"], featured: true },
  { id: "biometric-attendance", label: "Biometric attendance", category: "Connected apps", href: "/features/biometric-attendance", icon: "Fingerprint", summary: "Sync attendance events from supported devices.", state: "Setup required", roles: schoolAdmins },
  { id: "parent-app", label: "Parent & student app", category: "Connected apps", href: "/features/parent-app", icon: "Smartphone", summary: "Mobile access to attendance, homework, fees, and notices.", state: "Setup required", roles: [...schoolAdmins, "teacher", "parent", "student"], featured: true },
  { id: "online-payments", label: "Online fee payments", category: "Connected apps", href: "/features/online-payments", icon: "WalletCards", summary: "Accept payments through configured payment providers.", state: "Setup required", roles: [...financeRoles, "parent"] },
  { id: "exams-results", label: "Exams & results", category: "School operations", href: "/features/exams-results", icon: "ClipboardCheck", summary: "Exam schedules, marks, grading, and report cards.", state: "Setup required", roles: studentFacingRoles, featured: true },
  { id: "parent-communication", label: "Parent communication", category: "School operations", href: "/features/parent-communication", icon: "MessageSquareText", summary: "Notices and family communication across channels.", state: "Setup required", roles: [...schoolAdmins, "teacher", "parent"] },
  { id: "inventory-assets", label: "Inventory & assets", category: "School operations", href: "/features/inventory-assets", icon: "PackageOpen", summary: "Stock, equipment, maintenance, and asset assignments.", state: "Setup required", roles: schoolAdmins },
  { id: "library", label: "Library management", category: "School operations", href: "/features/library", icon: "LibraryBig", summary: "Books, lending, returns, and catalogue management.", state: "Setup required", roles: [...schoolAdmins, "librarian", "student", "parent"] },
  { id: "transport", label: "Transport management", category: "School operations", href: "/features/transport", icon: "BusFront", summary: "Routes, vehicles, driver assignments, and tracking.", state: "Setup required", roles: [...schoolAdmins, "transport_manager", "driver", "parent"] },
  { id: "hostel", label: "Hostel management", category: "School operations", href: "/features/hostel", icon: "Building2", summary: "Rooms, allotments, and resident records.", state: "Setup required", roles: schoolAdmins },
  { id: "lms", label: "LMS & online classes", category: "School operations", href: "/features/lms", icon: "MonitorPlay", summary: "Study material, assignments, and online class links.", state: "Setup required", roles: studentFacingRoles },
  { id: "certificates", label: "Certificates & reports", category: "School operations", href: "/features/certificates", icon: "Award", summary: "Bonafide, transfer, and custom certificates.", state: "Setup required", roles: [...schoolAdmins, "teacher", "parent", "student"] },
  { id: "languages", label: "Multi-language", category: "Administration", href: "/features/languages", icon: "Languages", summary: "Language and regional settings for school teams.", state: "Setup required", roles: schoolAdmins },
  { id: "security", label: "Data security", category: "Administration", href: "/features/security", icon: "ShieldCheck", summary: "Access controls, audit practices, and backup settings.", state: "Setup required", roles: schoolAdmins },
  { id: "communication-hub", label: "Communication hub", category: "School operations", href: "/features/communication-hub", icon: "Activity", summary: "Coordinate messages across email, SMS, and chat.", state: "Setup required", roles: [...schoolAdmins, "teacher", "parent"] },
];

export function canAccessFeature(role: string, featureId: FeatureId) {
  const feature = features.find((item) => item.id === featureId);
  return Boolean(feature?.roles.includes(role as AppRole));
}

export function getRoleFeatures(role: string) {
  return features.filter((feature) => feature.roles.includes(role as AppRole));
}

export function getFeatureByHref(href: string) {
  return features.find((feature) => feature.href === href);
}

