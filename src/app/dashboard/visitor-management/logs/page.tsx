'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Search } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import type { Visitor } from '@/types';
import { format } from 'date-fns';

const LOCAL_STORAGE_VISITORS_KEY = 'estateWatchResidentVisitors';

export default function VisitorLogsPage() {
  const [logs, setLogs] = useState<Visitor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedVisitors = localStorage.getItem(LOCAL_STORAGE_VISITORS_KEY);
      if (storedVisitors) {
        const parsedVisitors: Visitor[] = JSON.parse(storedVisitors).map((v: any) => ({
          ...v,
          authorizationDate: new Date(v.authorizationDate),
          visitDate: v.visitDate ? new Date(v.visitDate) : undefined,
          entryTime: v.entryTime ? new Date(v.entryTime) : undefined,
          exitTime: v.exitTime ? new Date(v.exitTime) : undefined,
        }));
        setLogs(parsedVisitors);
      }
    } catch (error) {
      console.error("Failed to load visitor logs from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const filteredLogs = logs.filter(log => 
    log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.accessCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full shadow-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center text-3xl font-bold text-primary">
                <ClipboardList className="mr-3 h-10 w-10" />
                Visitor Logs
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Review records of all visitor entries and exits.
              </CardDescription>
            </div>
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search logs..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-4">Loading logs...</p>
          ) : filteredLogs.length === 0 ? (
             <div className="text-center py-10">
                <Image 
                    src="https://placehold.co/300x200.png"
                    alt="No logs found"
                    width={300}
                    height={200}
                    className="mx-auto rounded-lg mb-4"
                    data-ai-hint="empty data"
                />
                <p className="text-xl text-muted-foreground">No visitor logs found matching your criteria.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor Name</TableHead>
                  <TableHead>Access Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expected Visit</TableHead>
                  <TableHead>Checked In</TableHead>
                  <TableHead>Checked Out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.name}</TableCell>
                    <TableCell><Badge variant="secondary" className="font-mono">{log.accessCode}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={
                          log.status === 'Pending' ? 'default' : 
                          log.status === 'Checked-In' ? 'outline' : 
                          'secondary'
                        } className={log.status === 'Checked-In' ? 'border-accent text-accent' : ''}>
                          {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.visitDate ? format(log.visitDate, 'PP') : 'N/A'}</TableCell>
                    <TableCell>{log.entryTime ? format(log.entryTime, 'PP p') : 'N/A'}</TableCell>
                    <TableCell>{log.exitTime ? format(log.exitTime, 'PP p') : 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
