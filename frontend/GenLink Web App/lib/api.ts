import { API_CONFIG } from "@/config/api";
import {
  Account,
  ActiveVolunteerProfile,
  AvailabilityType,
  LoginResponse,
  RegisterPayload,
  Report,
  ReportCreatePayload,
  ReportStats,
  ReportType,
  AccountUpdatePayload,
} from "@/types";

import { authStorage } from "./auth-storage";

const withBase = (path: string) => `${API_CONFIG.BASE_URL}${path}`;

const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    const storedToken = authStorage.getToken();
    if (storedToken) {
      headers["Authorization"] = `Bearer ${storedToken}`;
    }
  }

  return headers;
};

export const api = {
  accounts: {
    update: async (payload: AccountUpdatePayload) => {
      const response = await fetch(withBase("/api/v1/accounts/me"), {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update account");
      }

      return (await response.json()) as Account;
    },
    activeVolunteers: async () => {
      const response = await fetch(
        withBase("/api/v1/accounts/volunteers/active"),
      );

      if (!response.ok) {
        throw new Error("Failed to load active volunteers");
      }

      return (await response.json()) as ActiveVolunteerProfile[];
    },
    deleteMe: async () => {
      const response = await fetch(withBase("/api/v1/accounts/me"), {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }
    },
  },
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const response = await fetch(withBase("/api/v1/accounts/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      return (await response.json()) as LoginResponse;
    },
    register: async (data: RegisterPayload) => {
      const response = await fetch(withBase("/api/v1/accounts/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      return await response.json();
    },
    me: async () => {
      const response = await fetch(withBase("/api/v1/accounts/me"), {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      return (await response.json()) as Account;
    },
  },
  reports: {
    create: async (data: ReportCreatePayload) => {
      const response = await fetch(withBase("/api/v1/reports/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create report");
      }

      return (await response.json()) as Report;
    },
    list: async (params?: {
      city?: string;
      report_type_id?: number;
      limit?: number;
      skip?: number;
      search?: string;
      date_from?: string;
      date_to?: string;
    }) => {
      const url = new URL(withBase("/api/v1/reports/"));

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(url.toString(), {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      return (await response.json()) as Report[];
    },
    by_id: async (id: number | string) => {
      const response = await fetch(withBase(`/api/v1/reports/${id}`), {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch report");
      }

      return (await response.json()) as Report;
    },
    stats: async () => {
      const response = await fetch(withBase("/api/v1/reports/stats"), {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      return (await response.json()) as ReportStats;
    },
  },
  types: {
    availability: async () => {
      const response = await fetch(withBase("/api/v1/types/availability"));

      if (!response.ok) {
        throw new Error("Failed to fetch availability types");
      }

      return (await response.json()) as AvailabilityType[];
    },
    reportTypes: async () => {
      const response = await fetch(withBase("/api/v1/types/report_types"));

      if (!response.ok) {
        throw new Error("Failed to fetch report types");
      }

      return (await response.json()) as ReportType[];
    },
  },
};
