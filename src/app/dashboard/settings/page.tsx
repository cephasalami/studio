'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import Image from 'next/image';

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Image 
                src="https://placehold.co/400x200.png"
                alt="Settings banner"
                width={400}
                height={200}
                className="rounded-t-lg object-cover"
                data-ai-hint="settings cog"
            />
           </div>
          <CardTitle className="flex items-center justify-center text-3xl font-bold text-primary">
            <Settings className="mr-3 h-10 w-10 animate-spin-slow" />
            Application Settings
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Configure your EstateWatch experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-xl">
            Settings customization options are under construction!
          </p>
          <p className="text-muted-foreground">
            Soon you will be able to manage themes, notification preferences, language settings, and more.
          </p>
          <div className="flex justify-center">
            <Settings className="h-24 w-24 text-accent opacity-50 animate-spin-slow-reverse" />
          </div>
        </CardContent>
      </Card>
      <style jsx>{`
        .animate-spin-slow {
          animation: spin 5s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-reverse 5s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
