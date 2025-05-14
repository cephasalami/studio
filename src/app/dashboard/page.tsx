'use client';

import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/types';
import { ResidentDashboardView } from '@/components/dashboard/resident-view';
import { SecurityDashboardView } from '@/components/dashboard/security-view';
import { PlaceholderRoleView } from '@/components/dashboard/placeholder-role-view';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { userRole } = useAuth();

  const renderDashboardContent = () => {
    switch (userRole) {
      case UserRole.RESIDENT:
        return <ResidentDashboardView />;
      case UserRole.SECURITY_OPERATIVE:
        return <SecurityDashboardView />;
      case UserRole.ESTATE_MANAGER:
        return <PlaceholderRoleView role={UserRole.ESTATE_MANAGER} />;
      case UserRole.ADMIN:
        return <PlaceholderRoleView role={UserRole.ADMIN} />;
      case UserRole.SUPER_ADMIN:
        return <PlaceholderRoleView role={UserRole.SUPER_ADMIN} />;
      default:
        return (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertCircle className="mr-2" />
                Access Denied or Role Undefined
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Your role is not recognized or you do not have access to this dashboard. Please contact support.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderDashboardContent()}
    </div>
  );
}
