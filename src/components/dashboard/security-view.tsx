'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Visitor } from '@/types';
import { ScanLine, LogIn, LogOut, User, CalendarText, HelpCircle, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const checkInFormSchema = z.object({
  accessCode: z.string().min(1, { message: 'Access code is required.' }),
});

type CheckInFormValues = z.infer<typeof checkInFormSchema>;

const LOCAL_STORAGE_VISITORS_KEY = 'estateWatchResidentVisitors'; // Assuming security uses the same list for verification

export function SecurityDashboardView() {
  const { toast } = useToast();
  const [verifiedVisitor, setVerifiedVisitor] = useState<Visitor | null>(null);
  const [allVisitors, setAllVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    try {
      const storedVisitors = localStorage.getItem(LOCAL_STORAGE_VISITORS_KEY);
      if (storedVisitors) {
        setAllVisitors(JSON.parse(storedVisitors).map((v: Visitor) => ({
          ...v,
          authorizationDate: new Date(v.authorizationDate),
          visitDate: v.visitDate ? new Date(v.visitDate) : undefined,
        })));
      }
    } catch (error) {
      console.error("Failed to load visitors from localStorage", error);
      toast({ title: "Error", description: "Could not load visitor data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Persist changes to allVisitors back to localStorage
   useEffect(() => {
    if(!isLoading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_VISITORS_KEY, JSON.stringify(allVisitors));
      } catch (error) {
        console.error("Failed to save visitor data to localStorage", error);
        // Potentially toast an error, but be mindful of toast spamming on frequent updates
      }
    }
  }, [allVisitors, isLoading]);


  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInFormSchema),
    defaultValues: { accessCode: '' },
  });

  async function onSubmit(values: CheckInFormValues) {
    if (isLoading) {
      toast({ title: "System Busy", description: "Visitor data is still loading. Please try again shortly.", variant: "destructive"});
      return;
    }
    // Simulate API call to verify code
    await new Promise(resolve => setTimeout(resolve, 500));
    const visitor = allVisitors.find(v => v.accessCode === values.accessCode && v.status !== 'Expired' && v.status !== 'Checked-Out');
    
    if (visitor) {
      // Check if visit date is today or in the past (for pending)
      const today = new Date();
      today.setHours(0,0,0,0);
      const visitDate = visitor.visitDate ? new Date(visitor.visitDate) : null;
      if (visitDate) visitDate.setHours(0,0,0,0);

      if (visitor.status === 'Pending' && visitDate && visitDate.getTime() !== today.getTime()) {
        setVerifiedVisitor(null);
        toast({
          title: 'Verification Failed',
          description: `Access code is for a visit on ${format(visitDate, "PPP")}. Today is ${format(today, "PPP")}.`,
          variant: 'destructive',
        });
        return;
      }

      setVerifiedVisitor(visitor);
      toast({
        title: 'Visitor Verified',
        description: `Details for ${visitor.name} loaded.`,
      });
    } else {
      setVerifiedVisitor(null);
      toast({
        title: 'Verification Failed',
        description: 'Access code is invalid, expired, or already used.',
        variant: 'destructive',
      });
    }
    form.reset();
  }

  const handleCheckIn = () => {
    if (verifiedVisitor) {
      const updatedVisitor = { ...verifiedVisitor, status: 'Checked-In' as 'Checked-In', entryTime: new Date() };
      setVerifiedVisitor(updatedVisitor);
      setAllVisitors(prev => prev.map(v => v.id === updatedVisitor.id ? updatedVisitor : v));
      toast({ title: 'Check-In Successful', description: `${verifiedVisitor.name} has been checked in.` });
    }
  };

  const handleCheckOut = () => {
    if (verifiedVisitor) {
      const updatedVisitor = { ...verifiedVisitor, status: 'Checked-Out' as 'Checked-Out', exitTime: new Date() };
      setVerifiedVisitor(updatedVisitor); // Clear current display or update
      setAllVisitors(prev => prev.map(v => v.id === updatedVisitor.id ? updatedVisitor : v));
      toast({ title: 'Check-Out Successful', description: `${verifiedVisitor.name} has been checked out.` });
      setVerifiedVisitor(null); // Clear display after checkout
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ScanLine className="mr-2 h-6 w-6 text-primary" />
            Visitor Verification
          </CardTitle>
          <CardDescription>Enter visitor's access code to verify their details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="accessCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter access code" {...field} className="font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || isLoading}>
                {isLoading ? "Loading Data..." : (form.formState.isSubmitting ? 'Verifying...' : 'Verify Code')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {verifiedVisitor && (
        <Card className="shadow-lg animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="flex items-center text-accent">
              <ShieldCheck className="mr-2 h-6 w-6" />
              Verified Visitor Details
            </CardTitle>
            <CardDescription>Visitor successfully verified. Please confirm identity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center">
              <User className="mr-3 h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">Name:</span>
              <span className="ml-2">{verifiedVisitor.name}</span>
            </div>
            <div className="flex items-center">
              <HelpCircle className="mr-3 h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">Purpose:</span>
              <span className="ml-2">{verifiedVisitor.purpose}</span>
            </div>
             <div className="flex items-center">
              <CalendarText className="mr-3 h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">Expected Visit:</span>
              <span className="ml-2">{verifiedVisitor.visitDate ? format(new Date(verifiedVisitor.visitDate), "PPP") : 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <User className="mr-3 h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">Authorized By:</span>
              <span className="ml-2">{verifiedVisitor.authorizedBy}</span>
            </div>
            <div className="flex items-center">
                <ScanLine className="mr-3 h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">Status:</span>
                <Badge variant={verifiedVisitor.status === 'Pending' ? 'default' : 'outline'} className={cn("ml-2", verifiedVisitor.status === 'Checked-In' && 'border-accent text-accent')}>
                    {verifiedVisitor.status}
                </Badge>
            </div>
            {verifiedVisitor.entryTime && (
                 <div className="flex items-center">
                    <LogIn className="mr-3 h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Checked In:</span>
                    <span className="ml-2">{format(new Date(verifiedVisitor.entryTime), "PPP p")}</span>
                </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            {verifiedVisitor.status === 'Pending' && (
              <Button onClick={handleCheckIn} className="bg-green-600 hover:bg-green-700 text-white">
                <LogIn className="mr-2 h-4 w-4" /> Check-In
              </Button>
            )}
            {verifiedVisitor.status === 'Checked-In' && (
              <Button onClick={handleCheckOut} variant="destructive">
                <LogOut className="mr-2 h-4 w-4" /> Check-Out
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
