'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCog } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center">
           <div className="mx-auto mb-4">
            <Image 
                src="https://placehold.co/400x200.png"
                alt="Profile banner"
                width={400}
                height={200}
                className="rounded-t-lg object-cover"
                data-ai-hint="profile user"
            />
           </div>
          <CardTitle className="flex items-center justify-center text-3xl font-bold text-primary">
            <UserCog className="mr-3 h-10 w-10" />
            My Profile
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            View and manage your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-xl">
            Profile management features are coming soon!
          </p>
          <p className="text-muted-foreground">
            Soon you'll be able to update your contact details, change your password, 
            and manage your notification preferences right here.
          </p>
          <div className="flex justify-center">
            <UserCog className="h-24 w-24 text-accent opacity-50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
