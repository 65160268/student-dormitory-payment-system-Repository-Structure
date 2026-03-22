export const roles = ["student", "staff", "finance", "manager", "admin"];

export const roleLabels = {
  student: "Student",
  staff: "Staff",
  finance: "Finance",
  manager: "Manager",
  admin: "Admin",
};

export function isValidRole(value) {
  return roles.includes(value);
}

export function isRolePathAllowed(userRole, routeRole) {
  return userRole === routeRole;
}
