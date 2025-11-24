import { API_CONFIG } from "@/config/api";
import {
  Account,
  ActiveVolunteersSummary,
  AverageResponseTime,
  LoginResponse,
  RegisterPayload,
  Report,
  ReportCreatePayload,
  ReportStats,
  ReportType,
  AccountUpdatePayload,
} from "@/types";

import { authStorage } from "./auth-storage";
import { buildApiError } from "./api-error";

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

const parseJsonOrThrow = async <T>(response: Response) => {
  if (!response.ok) {
    throw await buildApiError(response);
  }

  return (await response.json()) as T;
};

const ensureSuccess = async (response: Response) => {
  if (!response.ok) {
    throw await buildApiError(response);
  }
};

export const api = {
  accounts: {
    update: async (payload: AccountUpdatePayload) => {
      const response = await fetch(withBase("/api/v1/accounts/me"), {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      return await parseJsonOrThrow<Account>(response);
    },
    activeVolunteers: async () => {
      const response = await fetch(
        withBase("/api/v1/accounts/volunteers/active"),
      );

      return await parseJsonOrThrow<ActiveVolunteersSummary>(response);
    },
    deleteMe: async () => {
      const response = await fetch(withBase("/api/v1/accounts/me"), {
        method: "DELETE",
        headers: getHeaders(),
      });

      await ensureSuccess(response);
    },
  },
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const response = await fetch(withBase("/api/v1/accounts/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      return await parseJsonOrThrow<LoginResponse>(response);
    },
    register: async (data: RegisterPayload) => {
      const response = await fetch(withBase("/api/v1/accounts/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      return await parseJsonOrThrow(response);
    },
    me: async () => {
      const response = await fetch(withBase("/api/v1/accounts/me"), {
        headers: getHeaders(),
      });

      return await parseJsonOrThrow<Account>(response);
    },
  },
  reports: {
    create: async (data: ReportCreatePayload) => {
      const response = await fetch(withBase("/api/v1/reports"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      return await parseJsonOrThrow<Report>(response);
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
      const url = new URL(withBase("/api/v1/reports"));

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

      return await parseJsonOrThrow<Report[]>(response);
    },
    by_id: async (id: number | string) => {
      const response = await fetch(withBase(`/api/v1/reports/${id}`), {
        headers: getHeaders(),
      });

      return await parseJsonOrThrow<Report>(response);
    },
    myAcceptedReport: async () => {
      const response = await fetch(withBase("/api/v1/reports/my-accepted-report"), {
        headers: getHeaders(),
      });

      return await parseJsonOrThrow<{ report_id: number | null }>(response);
    },
    myCompleted: async (params?: { skip?: number; limit?: number }) => {
      const url = new URL(withBase("/api/v1/reports/my-completed-reports"));

      if (params?.skip !== undefined) {
        url.searchParams.append("skip", String(params.skip));
      }
      if (params?.limit !== undefined) {
        url.searchParams.append("limit", String(params.limit));
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: getHeaders(),
      });

      return await parseJsonOrThrow<Report[]>(response);
    },
    stats: async () => {
      const response = await fetch(withBase("/api/v1/reports/stats"), {
        headers: getHeaders(),
      });

      return await parseJsonOrThrow<ReportStats>(response);
    },
    accept: async (id: number | string) => {
      const response = await fetch(withBase(`/api/v1/reports/${id}/accept`), {
        method: "POST",
        headers: getHeaders(),
      });

      return await parseJsonOrThrow<Report>(response);
    },
    active: {
      cancel: async () => {
        const response = await fetch(
          withBase("/api/v1/reports/active/cancel"),
          {
            method: "POST",
            headers: getHeaders(),
          },
        );

        return await parseJsonOrThrow<Report>(response);
      },
      complete: async () => {
        const response = await fetch(
          withBase("/api/v1/reports/active/complete"),
          {
            method: "POST",
            headers: getHeaders(),
          },
        );

        return await parseJsonOrThrow<Report>(response);
      },
    },
    metrics: {
      avgResponseTime: async () => {
        const response = await fetch(
          withBase("/api/v1/reports/metrics/avg-response-time")
        );

        return await parseJsonOrThrow<AverageResponseTime>(response);
      },
    },
  },
  types: {
    reportTypes: async () => {
      const response = await fetch(withBase("/api/v1/types/report_types"));

      return await parseJsonOrThrow<ReportType[]>(response);
    },
  },
  system: {
    stats: async () => {
      const response = await fetch(withBase("/api/v1/system/stats"), {
        headers: getHeaders(),
      });

      return await parseJsonOrThrow<any>(response);
    },
  },
};
