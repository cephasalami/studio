'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  KeyRound,
  ShieldAlert,
  Building,
  ClipboardList,
  UserCog,
  LogOut,
  Home,
  Car,
  ScanLine
} from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  subItems?: NavItem[];
  isAction?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: Object.values(UserRole) },
  { href: '/dashboard/profile', label: 'My Profile', icon: UserCog, roles: Object.values(UserRole) },
  { 
    href: '/dashboard/visitor-management', 
    label: 'Visitor Management', 
    icon: Users, 
    roles: [UserRole.RESIDENT, UserRole.SECURITY_OPERATIVE, UserRole.ESTATE_MANAGER, UserRole.ADMIN],
    subItems: [
      { href: '/dashboard/visitor-management/pre-authorize', label: 'Pre-Authorize Visitor', icon: UserCheck, roles: [UserRole.RESIDENT] },
      { href: '/dashboard/visitor-management/check-in-out', label: 'Check-In/Out', icon: ScanLine, roles: [UserRole.SECURITY_OPERATIVE] },
      { href: '/dashboard/visitor-management/logs', label: 'Visitor Logs', icon: ClipboardList, roles: [UserRole.ESTATE_MANAGER, UserRole.ADMIN, UserRole.SECURITY_OPERATIVE] },
    ]
  },
  { 
    href: '/dashboard/estate-administration', 
    label: 'Estate Administration', 
    icon: Building, 
    roles: [UserRole.ESTATE_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    subItems: [
      { href: '/dashboard/estate-administration/residents', label: 'Manage Residents', icon: Home, roles: [UserRole.ESTATE_MANAGER, UserRole.ADMIN] },
      { href: '/dashboard/estate-administration/security-staff', label: 'Manage Security', icon: ShieldAlert, roles: [UserRole.ESTATE_MANAGER, UserRole.ADMIN] },
      { href: '/dashboard/estate-administration/vehicles', label: 'Manage Vehicles', icon: Car, roles: [UserRole.ESTATE_MANAGER, UserRole.ADMIN] },
    ]
  },
  { href: '/dashboard/security-operations', label: 'Security Ops', icon: ShieldAlert, roles: [UserRole.SECURITY_OPERATIVE, UserRole.ESTATE_MANAGER, UserRole.ADMIN] },
  { href: '/dashboard/system-management', label: 'System Management', icon: KeyRound, roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
];

export function SidebarNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <SidebarMenu>
      {filteredNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild={!item.subItems}
            isActive={pathname === item.href || (item.subItems && pathname.startsWith(item.href))}
            className="w-full justify-start"
            tooltip={item.label}
          >
            {item.subItems ? (
              <span>
                <item.icon className="mr-2 inline-block" />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </span>
            ) : (
              <Link href={item.href}>
                <item.icon className="mr-2 inline-block" />
                 <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </Link>
            )}
          </SidebarMenuButton>
          {item.subItems && (
             <SidebarMenuSub className={pathname.startsWith(item.href) ? "block" : "hidden group-data-[collapsible=icon]:hidden"}>
              {item.subItems.filter(subItem => subItem.roles.includes(role)).map(subItem => (
                <SidebarMenuSubItem key={subItem.href}>
                  <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                    <Link href={subItem.href}>
                      <subItem.icon className="mr-2 inline-block" />
                      <span>{subItem.label}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      ))}
      <SidebarMenuItem className="mt-auto">
         <SidebarMenuButton onClick={logout} className="w-full justify-start" tooltip="Logout">
            <LogOut className="mr-2 inline-block" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
