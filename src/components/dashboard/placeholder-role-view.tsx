'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserRole } from '@/types';
import { Construction } from 'lucide-react';
import Image from 'next/image';

interface PlaceholderRoleViewProps {
  role: UserRole;
}

export function PlaceholderRoleView({ role }: PlaceholderRoleViewProps) {
  return (
    <Card className="shadow-lg w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <Image 
            src="https://placehold.co/600x400.png"
            alt="Under Construction"
            width={300}
            height={200}
            className="rounded-lg"
            data-ai-hint="construction development"
          />
        </div>
        <CardTitle className="flex items-center justify-center text-2xl">
          <Construction className="mr-3 h-8 w-8 text-accent" />
          {role} Dashboard
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          This section is currently under development.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-4">
          We are working hard to bring you the full functionality for the {role} role. 
          Exciting features are coming soon!
        </p>
        <p>
          In the meantime, please explore other available sections of EstateWatch.
        </p>
      </CardContent>
    </Card>
  );
}
