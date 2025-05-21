import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqiwhtwrpbhukznrabts.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxaXdodHdycGJodWt6bnJhYnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3ODA0MzcsImV4cCI6MjA2MzM1NjQzN30.Y1DXygqbFJXAKB7V47c8fcNLbjIRsJsUx8IAEJbpfx8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: 'Super Admin' | 'Admin' | 'Estate Manager' | 'Resident' | 'Security Operative';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role: 'Super Admin' | 'Admin' | 'Estate Manager' | 'Resident' | 'Security Operative';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'Super Admin' | 'Admin' | 'Estate Manager' | 'Resident' | 'Security Operative';
          created_at?: string;
          updated_at?: string;
        };
      };
      visitors: {
        Row: {
          id: string;
          name: string;
          purpose: string;
          access_code: string;
          authorized_by: string;
          entry_time: string | null;
          exit_time: string | null;
          status: 'Pending' | 'Checked-In' | 'Checked-Out' | 'Expired';
          authorization_date: string;
          visit_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          purpose: string;
          access_code: string;
          authorized_by: string;
          entry_time?: string | null;
          exit_time?: string | null;
          status?: 'Pending' | 'Checked-In' | 'Checked-Out' | 'Expired';
          authorization_date?: string;
          visit_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          purpose?: string;
          access_code?: string;
          authorized_by?: string;
          entry_time?: string | null;
          exit_time?: string | null;
          status?: 'Pending' | 'Checked-In' | 'Checked-Out' | 'Expired';
          authorization_date?: string;
          visit_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};