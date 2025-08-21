/**
 * Admin Configuration
 * 
 * This file contains all admin-related configuration including user IDs,
 * permissions, and access controls. In production, this should be stored
 * securely and managed through a proper admin management system.
 */

// Admin user IDs - Add your admin user IDs here
// These users will have access to transaction logs and other admin features
export const ADMIN_USER_IDS: string[] = [
  // Add your admin user IDs here
  // Example: 'your-admin-user-id-here'
  // You can get your user ID from Firebase Auth or from the user profile
  // TODO: Replace with your actual user ID from browser console
];

// Admin email domains - Users with these email domains automatically get admin access
// This makes it easier to manage admin access for team members
export const ADMIN_EMAIL_DOMAINS: string[] = [
  'fixmotech.org',  // Your company domain
  'admin.fixmotech.org', // Admin subdomain
  'fixmotech.com',  // Your company domain
  'fixmotech.org',  // Alternative domain
  // Add more domains as needed
];

// Add specific admin emails for testing
export const ADMIN_EMAILS: string[] = [
  'hyperion@fixmotech.com',  // Your specific email
  // Add more specific admin emails as needed
];

// Admin permissions configuration
export const ADMIN_PERMISSIONS = {
  // Transaction logs access
  VIEW_TRANSACTION_LOGS: 'view_transaction_logs',
  EXPORT_TRANSACTION_LOGS: 'export_transaction_logs',
  
  // User management
  VIEW_USERS: 'view_users',
  MANAGE_USERS: 'manage_users',
  
  // Task management
  VIEW_ALL_TASKS: 'view_all_tasks',
  MANAGE_TASKS: 'manage_tasks',
  
  // System management
  VIEW_SYSTEM_STATS: 'view_system_stats',
  MANAGE_SYSTEM: 'manage_system',
} as const;

// Admin role definitions
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const;

// Admin user role mapping
export const ADMIN_USER_ROLES: Record<string, string> = {
  // Map user IDs to roles
  // Example: 'user-id-here': ADMIN_ROLES.SUPER_ADMIN,
};

/**
 * Check if a user is an admin by user ID
 */
export function isAdminByUserId(userId: string): boolean {
  return ADMIN_USER_IDS.includes(userId);
}

/**
 * Check if a user is an admin by email domain
 */
export function isAdminByEmailDomain(email: string | null): boolean {
  if (!email) return false;
  
  // Check specific admin emails first
  if (ADMIN_EMAILS.includes(email.toLowerCase())) {
    return true;
  }
  
  // Then check email domains
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? ADMIN_EMAIL_DOMAINS.includes(domain) : false;
}

/**
 * Check if a user is an admin (by user ID or email domain)
 */
export function isAdmin(userId: string, email?: string | null): boolean {
  return isAdminByUserId(userId) || (email ? isAdminByEmailDomain(email) : false);
}

/**
 * Check if a user has a specific admin role
 */
export function hasAdminRole(userId: string, role: string): boolean {
  return ADMIN_USER_ROLES[userId] === role;
}

/**
 * Check if a user has super admin privileges
 */
export function isSuperAdmin(userId: string): boolean {
  return hasAdminRole(userId, ADMIN_ROLES.SUPER_ADMIN);
}

/**
 * Check if a user has admin privileges (admin or super admin)
 */
export function hasAdminPrivileges(userId: string): boolean {
  const role = ADMIN_USER_ROLES[userId];
  return role === ADMIN_ROLES.ADMIN || role === ADMIN_ROLES.SUPER_ADMIN;
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(userId: string, email?: string | null): string[] {
  // If user is admin by email domain, give them basic admin permissions
  if (email && isAdminByEmailDomain(email)) {
    return [
      ADMIN_PERMISSIONS.VIEW_TRANSACTION_LOGS,
      ADMIN_PERMISSIONS.VIEW_USERS,
      ADMIN_PERMISSIONS.VIEW_ALL_TASKS,
      ADMIN_PERMISSIONS.VIEW_SYSTEM_STATS,
    ];
  }

  const role = ADMIN_USER_ROLES[userId];
  const permissions: string[] = [];

  switch (role) {
    case ADMIN_ROLES.SUPER_ADMIN:
      // Super admin has all permissions
      permissions.push(...Object.values(ADMIN_PERMISSIONS));
      break;
    case ADMIN_ROLES.ADMIN:
      // Admin has most permissions except system management
      permissions.push(
        ADMIN_PERMISSIONS.VIEW_TRANSACTION_LOGS,
        ADMIN_PERMISSIONS.EXPORT_TRANSACTION_LOGS,
        ADMIN_PERMISSIONS.VIEW_USERS,
        ADMIN_PERMISSIONS.MANAGE_USERS,
        ADMIN_PERMISSIONS.VIEW_ALL_TASKS,
        ADMIN_PERMISSIONS.MANAGE_TASKS,
        ADMIN_PERMISSIONS.VIEW_SYSTEM_STATS,
      );
      break;
    case ADMIN_ROLES.MODERATOR:
      // Moderator has limited permissions
      permissions.push(
        ADMIN_PERMISSIONS.VIEW_TRANSACTION_LOGS,
        ADMIN_PERMISSIONS.VIEW_USERS,
        ADMIN_PERMISSIONS.VIEW_ALL_TASKS,
        ADMIN_PERMISSIONS.VIEW_SYSTEM_STATS,
      );
      break;
  }

  return permissions;
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userId: string, permission: string, email?: string | null): boolean {
  const permissions = getUserPermissions(userId, email);
  return permissions.includes(permission);
}

/**
 * Get admin user information
 */
export function getAdminUserInfo(userId: string, email?: string | null) {
  if (!isAdmin(userId, email)) {
    return null;
  }

  const isEmailDomainAdmin = email ? isAdminByEmailDomain(email) : false;
  const role = isEmailDomainAdmin ? ADMIN_ROLES.ADMIN : (ADMIN_USER_ROLES[userId] || ADMIN_ROLES.ADMIN);

  return {
    userId,
    email,
    role,
    permissions: getUserPermissions(userId, email),
    isSuperAdmin: isSuperAdmin(userId),
    hasAdminPrivileges: hasAdminPrivileges(userId) || isEmailDomainAdmin,
    isEmailDomainAdmin,
  };
}

/**
 * Get all admin users
 */
export function getAllAdminUsers() {
  return ADMIN_USER_IDS.map(userId => getAdminUserInfo(userId)).filter(Boolean);
}

/**
 * Add a new admin user
 * Note: In production, this should be done through a secure admin interface
 */
export function addAdminUser(userId: string, role: string = ADMIN_ROLES.ADMIN) {
  if (!ADMIN_USER_IDS.includes(userId)) {
    ADMIN_USER_IDS.push(userId);
  }
  ADMIN_USER_ROLES[userId] = role;
}

/**
 * Remove an admin user
 * Note: In production, this should be done through a secure admin interface
 */
export function removeAdminUser(userId: string) {
  const index = ADMIN_USER_IDS.indexOf(userId);
  if (index > -1) {
    ADMIN_USER_IDS.splice(index, 1);
  }
  delete ADMIN_USER_ROLES[userId];
}

/**
 * Update admin user role
 * Note: In production, this should be done through a secure admin interface
 */
export function updateAdminUserRole(userId: string, role: string) {
  if (ADMIN_USER_IDS.includes(userId)) {
    ADMIN_USER_ROLES[userId] = role;
  }
}

/**
 * Add an admin email domain
 */
export function addAdminEmailDomain(domain: string) {
  const normalizedDomain = domain.toLowerCase();
  if (!ADMIN_EMAIL_DOMAINS.includes(normalizedDomain)) {
    ADMIN_EMAIL_DOMAINS.push(normalizedDomain);
  }
}

/**
 * Remove an admin email domain
 */
export function removeAdminEmailDomain(domain: string) {
  const normalizedDomain = domain.toLowerCase();
  const index = ADMIN_EMAIL_DOMAINS.indexOf(normalizedDomain);
  if (index > -1) {
    ADMIN_EMAIL_DOMAINS.splice(index, 1);
  }
}

// Export types for TypeScript
export type AdminPermission = typeof ADMIN_PERMISSIONS[keyof typeof ADMIN_PERMISSIONS];
export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES]; 