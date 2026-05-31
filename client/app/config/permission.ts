// ORGANIZATION TYPES

export type OrganizationType = "school" | "coaching" | "creator";

// PERMISSION TYPES

export interface Permission {
  create?: string;
  read: string;
  update?: string;
  delete?: string;
  publish?: string;
  invite?: string;
  manage?: string;
}

export interface ModulePermission {
  display: string;
  name: string;
  permissions: Permission;
}

// CORE PERMISSIONS (ALL ORGANIZATIONS)

export const corePermissions: ModulePermission[] = [
  {
    display: "Dashboard",
    name: "dashboard",
    permissions: {
      read: "dashboard.read",
    },
  },

  {
    display: "Courses",
    name: "courses",
    permissions: {
      create: "courses.create",
      read: "courses.read",
      update: "courses.update",
      delete: "courses.delete",
      publish: "courses.publish",
    },
  },

  {
    display: "Lessons",
    name: "lessons",
    permissions: {
      create: "lessons.create",
      read: "lessons.read",
      update: "lessons.update",
      delete: "lessons.delete",
    },
  },

  {
    display: "Assignments",
    name: "assignments",
    permissions: {
      create: "assignments.create",
      read: "assignments.read",
      update: "assignments.update",
      delete: "assignments.delete",
      publish: "assignments.publish",
    },
  },

  {
    display: "Quizzes",
    name: "quizzes",
    permissions: {
      create: "quizzes.create",
      read: "quizzes.read",
      update: "quizzes.update",
      delete: "quizzes.delete",
      publish: "quizzes.publish",
    },
  },

  {
    display: "Analytics",
    name: "analytics",
    permissions: {
      read: "analytics.read",
    },
  },

  {
    display: "Files",
    name: "files",
    permissions: {
      create: "files.create",
      read: "files.read",
      delete: "files.delete",
    },
  },

  {
    display: "Notifications",
    name: "notifications",
    permissions: {
      create: "notifications.create",
      read: "notifications.read",
    },
  },

  {
    display: "Settings > Roles",
    name: "settings.roles",
    permissions: {
      create: "settings.roles.create",
      read: "settings.roles.read",
      update: "settings.roles.update",
      delete: "settings.roles.delete",
    },
  },

  {
    display: "Students",
    name: "students",
    permissions: {
      create: "students.create",
      read: "students.read",
      update: "students.update",
      delete: "students.delete",
    },
  },

  {
    display: "Payments",
    name: "payments",
    permissions: {
      read: "payments.read",
      manage: "payments.manage",
    },
  },

  {
    display: "Organization",
    name: "organisation",
    permissions: {
      read: "organisation.basic.read",
      update: "organisation.basic.update",
    },
  },
];

// SCHOOL MODULES

export const schoolPermissions: ModulePermission[] = [
  {
    display: "Teachers",
    name: "teachers",
    permissions: {
      create: "teachers.create",
      read: "teachers.read",
      update: "teachers.update",
      delete: "teachers.delete",
    },
  },

  {
    display: "Students",
    name: "students",
    permissions: {
      create: "students.create",
      read: "students.read",
      update: "students.update",
      delete: "students.delete",
    },
  },

  {
    display: "Parents",
    name: "parents",
    permissions: {
      create: "parents.create",
      read: "parents.read",
      update: "parents.update",
      delete: "parents.delete",
    },
  },

  {
    display: "Departments",
    name: "departments",
    permissions: {
      create: "departments.create",
      read: "departments.read",
      update: "departments.update",
      delete: "departments.delete",
    },
  },

  {
    display: "Batches",
    name: "batches",
    permissions: {
      create: "batches.create",
      read: "batches.read",
      update: "batches.update",
      delete: "batches.delete",
    },
  },

  {
    display: "Attendance",
    name: "attendance",
    permissions: {
      create: "attendance.create",
      read: "attendance.read",
      update: "attendance.update",
    },
  },
];

// COACHING MODULES

export const coachingPermissions: ModulePermission[] = [
  {
    display: "Teachers",
    name: "teachers",
    permissions: {
      create: "teachers.create",
      read: "teachers.read",
      update: "teachers.update",
      delete: "teachers.delete",
    },
  },

  {
    display: "Students",
    name: "students",
    permissions: {
      create: "students.create",
      read: "students.read",
      update: "students.update",
      delete: "students.delete",
    },
  },

  {
    display: "Batches",
    name: "batches",
    permissions: {
      create: "batches.create",
      read: "batches.read",
      update: "batches.update",
      delete: "batches.delete",
    },
  },

  {
    display: "Attendance",
    name: "attendance",
    permissions: {
      create: "attendance.create",
      read: "attendance.read",
      update: "attendance.update",
    },
  },

  {
    display: "Payments",
    name: "payments",
    permissions: {
      read: "payments.read",
      manage: "payments.manage",
    },
  },
];

// -----------------------------
// GET PERMISSIONS BY ORG TYPE
// -----------------------------

export function getPermissionsByOrgType(
  type: OrganizationType,
): ModulePermission[] {
  if (type === "school") {
    return [...corePermissions, ...schoolPermissions];
  }

  if (type === "coaching") {
    return [...corePermissions, ...coachingPermissions];
  }

  if (type === "creator") {
    return [...corePermissions, ...corePermissions];
  }

  return corePermissions;
}

// GET ALL PERMISSIONS STRINGS

export function getAllPermissions(type: OrganizationType): string[] {
  const modules = getPermissionsByOrgType(type);

  return modules.flatMap((module) => Object.values(module.permissions));
}

// PERMISSION EXIST
export function permissionExist(
  permission: string,
  type: OrganizationType,
): boolean {
  return getAllPermissions(type).includes(permission);
}
