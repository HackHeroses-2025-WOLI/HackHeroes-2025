import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type AppViewsCompact = boolean;

export interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface ReportType {
  id: number;
  name: string;
  description?: string | null;
}

export interface AvailabilityType {
  id: number;
  name: string;
  description?: string | null;
}

export interface Account {
  email: string;
  full_name: string;
  phone?: string | null;
  city?: string | null;
  resolved_cases: number;
  resolved_cases_this_year: number;
  active_report?: number | null;
  availability_json?: string | null;
  availability?: AvailabilitySlot[];
  is_active?: boolean;
  is_active_now?: boolean;
  schedule_active_now?: boolean;
  availability_type?: number | null;
  genpoints?: number | null;
}

export interface Report {
  id: number;
  full_name: string;
  phone: string;
  age?: number | null;
  address: string;
  city: string;
  problem: string;
  contact_ok: boolean;
  report_type_id: number;
  report_details?: string | null;
  reporter_email?: string | null;
  status?: string;
  is_reviewed?: boolean;
  reported_at: string;
  report_group?: string | null;
  accepted_at?: string | null;
  completed_at?: string | null;
}

export interface ReportStats {
  total_reports: number;
  by_type: Record<string, number>;
}

export interface ReportCreatePayload {
  full_name: string;
  phone: string;
  age?: number | null;
  address: string;
  city: string;
  problem: string;
  contact_ok?: boolean;
  report_type_id: number;
  report_details?: string | null;
  reporter_email?: string | null;
  is_reviewed?: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  city?: string;
  availability_type?: number | null;
}

export interface AccountUpdatePayload {
  full_name?: string;
  phone?: string | null;
  city?: string | null;
  availability?: AvailabilitySlot[];
  is_active?: boolean;
  availability_type?: number | null;
}

export interface ActiveVolunteerProfile {
  email: string;
  full_name: string;
  city?: string | null;
  availability?: AvailabilitySlot[];
  is_active: boolean;
  schedule_active_now: boolean;
  is_active_now: boolean;
}

export interface ActiveVolunteersSummary {
  total_manual_active: number;
  total_scheduled_active: number;
  volunteers: ActiveVolunteerProfile[];
}

export interface AverageResponseTime {
  average_response_minutes: number | null;
}
