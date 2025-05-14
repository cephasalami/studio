'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { UserRole } from '@/types';
import { LogOut, UserCircle, Settings, Shield } from 'lucide-react';
import Link from 'next/link';

interface UserNavProps {
  userRole: UserRole | null;
  onLogout: () => void;
}

export function UserNav({ userRole, onLogout }: UserNavProps) {
  const getInitials = (role: string | null) => {
    if (!role) return '??';
    const words = role.split(' ');
    if (words.length > 1) {
      return words.map(word => word[0]).join('').toUpperCase();
    }
    return role.substring(0, 2).toUpperCase();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary">
            {/* Placeholder for user avatar image */}
            {/* <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" /> */}
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {getInitials(userRole)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Signed In</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userRole || 'N/A'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
           {userRole === 'Super Admin' && (
             <DropdownMenuItem asChild>
                <Link href="/dashboard/admin-panel">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
             </DropdownMenuItem>
           )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
