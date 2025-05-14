export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Admin',
  ESTATE_MANAGER = 'Estate Manager',
  RESIDENT = 'Resident',
  SECURITY_OPERATIVE = 'Security Operative',
}

export interface Visitor {
  id: string;
  name: string;
  purpose: string;
  accessCode: string;
  authorizedBy: string; // Resident's name or ID
  entryTime?: Date | string;
  exitTime?: Date | string;
  status: 'Pending' | 'Checked-In' | 'Checked-Out' | 'Expired';
  authorizationDate: Date | string;
}

export const ALL_USER_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.ESTATE_MANAGER,
  UserRole.RESIDENT,
  UserRole.SECURITY_OPERATIVE,
];
