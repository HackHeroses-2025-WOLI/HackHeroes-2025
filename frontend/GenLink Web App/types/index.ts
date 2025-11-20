import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type AppViewsCompact = boolean;

export interface AvailabilityType {
  id: number;
  name: string;
  description: string;
}

export interface ReportType {
  id: number;
  name: string;
  description?: string | null;
}

export interface Account {
  email: string;
  full_name: string;
  phone?: string | null;
  city?: string | null;
  availability_type: number;
  resolved_cases: number;
  resolved_cases_this_year: number;
  active_report?: number | null;
  availability_json?: string | null;
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
  reported_at: string;
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
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}
