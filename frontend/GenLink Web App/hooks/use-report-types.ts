"use client";

import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { ReportType } from "@/types";

let cachedReportTypes: ReportType[] | null = null;
let inflightRequest: Promise<ReportType[]> | null = null;

const fetchReportTypes = async () => {
  if (cachedReportTypes) {
    return cachedReportTypes;
  }

  if (!inflightRequest) {
    inflightRequest = api.types
      .reportTypes()
      .then((data) => {
        cachedReportTypes = data;
        return data;
      })
      .finally(() => {
        inflightRequest = null;
      });
  }

  return inflightRequest;
};

export const useReportTypes = () => {
  const [reportTypes, setReportTypes] = useState<ReportType[]>(
    () => cachedReportTypes ?? [],
  );
  const [isLoading, setIsLoading] = useState(!cachedReportTypes);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(
    async (forceReload = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = forceReload
          ? await api.types.reportTypes()
          : await fetchReportTypes();

        cachedReportTypes = data;
        setReportTypes(data);
        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Nie udało się pobrać kategorii zgłoszeń.";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (cachedReportTypes) {
      setIsLoading(false);
      return;
    }

    sync().catch(() => {
      // Błędy są obsługiwane przez stan `error`
    });
  }, [sync]);

  const refresh = useCallback(async () => {
    await sync(true);
  }, [sync]);

  return { reportTypes, isLoading, error, refresh };
};
