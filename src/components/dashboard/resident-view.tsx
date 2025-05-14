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
import { UserCheck, QrCode, Trash2, CalendarDays, Edit3, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';

const visitorFormSchema = z.object({
  name: z.string().min(2, { message: 'Visitor name must be at least 2 characters.' }),
  purpose: z.string().min(3, { message: 'Purpose of visit is required.' }),
  visitDate: z.date({ required_error: "A visit date is required." }),
});

type VisitorFormValues = z.infer<typeof visitorFormSchema>;

const LOCAL_STORAGE_VISITORS_KEY = 'estateWatchResidentVisitors';

export function ResidentDashboardView() {
  const { toast } = useToast();
  const [authorizedVisitors, setAuthorizedVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedVisitors = localStorage.getItem(LOCAL_STORAGE_VISITORS_KEY);
      if (storedVisitors) {
        setAuthorizedVisitors(JSON.parse(storedVisitors).map((v: Visitor) => ({
          ...v,
          authorizationDate: new Date(v.authorizationDate),
          visitDate: v.visitDate ? new Date(v.visitDate) : undefined,
        })));
      }
    } catch (error) {
      console.error("Failed to load visitors from localStorage", error);
      toast({ title: "Error", description: "Could not load saved visitors.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if(!isLoading) { // Prevent writing initial empty state if still loading
      try {
        localStorage.setItem(LOCAL_STORAGE_VISITORS_KEY, JSON.stringify(authorizedVisitors));
      } catch (error) {
        console.error("Failed to save visitors to localStorage", error);
        toast({ title: "Error", description: "Could not save visitor data.", variant: "destructive" });
      }
    }
  }, [authorizedVisitors, toast, isLoading]);

  const form = useForm<VisitorFormValues>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      name: '',
      purpose: '',
      visitDate: new Date(),
    },
  });

  const generateAccessCode = () => `EW-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

  async function onSubmit(values: VisitorFormValues) {
    const newVisitor: Visitor = {
      id: crypto.randomUUID(),
      name: values.name,
      purpose: values.purpose,
      accessCode: generateAccessCode(),
      authorizedBy: 'Current Resident', // In a real app, this would be the logged-in resident's ID/name
      status: 'Pending',
      authorizationDate: new Date(),
      visitDate: values.visitDate,
    };
    setAuthorizedVisitors(prev => [newVisitor, ...prev]);
    toast({
      title: 'Visitor Pre-Authorized',
      description: `${values.name} has been pre-authorized. Access Code: ${newVisitor.accessCode}`,
    });
    form.reset();
  }

  const removeVisitor = (id: string) => {
    setAuthorizedVisitors(prev => prev.filter(visitor => visitor.id !== id));
    toast({ title: "Visitor Removed", description: "The visitor authorization has been revoked."});
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-1 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="mr-2 h-6 w-6 text-primary" />
            Pre-Authorize Visitor
          </CardTitle>
          <CardDescription>Enter visitor details to generate an access code.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visitor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose of Visit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Delivery, Meeting" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visitDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expected Date of Visit</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                 {form.formState.isSubmitting ? 'Generating Code...' : 'Generate Access Code'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="md:col-span-1 lg:col-span-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="mr-2 h-6 w-6 text-primary" />
            Authorized Visitors
          </CardTitle>
          <CardDescription>List of visitors you have pre-authorized.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading visitors...</p>
          ) : authorizedVisitors.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No visitors pre-authorized yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Access Code</TableHead>
                    <TableHead>Visit Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authorizedVisitors.map((visitor) => (
                    <TableRow key={visitor.id}>
                      <TableCell className="font-medium">{visitor.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">{visitor.accessCode}</Badge>
                      </TableCell>
                      <TableCell>{visitor.visitDate ? format(new Date(visitor.visitDate), "PPP") : 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={
                          visitor.status === 'Pending' ? 'default' : 
                          visitor.status === 'Checked-In' ? 'outline' : // Using outline for accent
                          'secondary' // Checked-out or Expired
                        } className={cn(
                          visitor.status === 'Checked-In' && 'border-accent text-accent'
                        )}>
                          {visitor.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary mr-1" onClick={() => alert('Edit functionality not implemented.')}>
                          <Edit3 size={16} />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeVisitor(visitor.id)}>
                          <Trash2 size={16} />
                           <span className="sr-only">Remove</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
         <CardFooter className="text-sm text-muted-foreground">
            <Clock size={14} className="mr-1.5" />
            Generated codes are typically valid for the specified visit date.
        </CardFooter>
      </Card>
    </div>
  );
}
