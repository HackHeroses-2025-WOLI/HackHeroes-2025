export type ApiFieldErrors = Record<string, string>;

interface ApiErrorOptions {
  status: number;
  detail?: unknown;
  fieldErrors?: ApiFieldErrors;
}

export class ApiError extends Error {
  status: number;
  detail?: unknown;
  fieldErrors: ApiFieldErrors;

  constructor(message: string, options: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.detail = options.detail;
    this.fieldErrors = options.fieldErrors ?? {};
  }
}

const extractFieldErrors = (detail: unknown): ApiFieldErrors => {
  if (!Array.isArray(detail)) {
    return {};
  }

  return detail.reduce<ApiFieldErrors>((memo, item) => {
    if (
      item &&
      typeof item === "object" &&
      Array.isArray((item as any).loc) &&
      typeof (item as any).msg === "string"
    ) {
      const path = (item as any).loc as Array<string | number>;
      const field = [...path].reverse().find((segment) => typeof segment === "string");

      if (field && typeof field === "string") {
        memo[field] = (item as any).msg as string;
      }
    }

    return memo;
  }, {});
};

export const buildApiError = async (response: Response) => {
  let bodyText: string | null = null;

  try {
    bodyText = await response.text();
  } catch {
    bodyText = null;
  }

  let payload: any = null;

  if (bodyText) {
    try {
      payload = JSON.parse(bodyText);
    } catch {
      payload = null;
    }
  }

  const detail = payload?.detail ?? payload ?? bodyText;
  const fieldErrors = extractFieldErrors(payload?.detail);
  let message: string | undefined =
    typeof payload?.message === "string" && payload.message.trim().length > 0
      ? payload.message
      : undefined;

  if (!message) {
    if (typeof payload?.detail === "string" && payload.detail.trim().length > 0) {
      message = payload.detail;
    } else if (typeof bodyText === "string" && bodyText.trim().length > 0) {
      message = bodyText.trim();
    } else {
      message = `Żądanie zakończyło się niepowodzeniem (HTTP ${response.status})`;
    }
  }

  const finalMessage = message ?? `Żądanie zakończyło się niepowodzeniem (HTTP ${response.status})`;

  return new ApiError(finalMessage, {
    status: response.status,
    detail,
    fieldErrors,
  });
};
