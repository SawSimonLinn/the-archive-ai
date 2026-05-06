const LOCAL_HOST_PATTERN = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;
const PRODUCTION_APP_ORIGIN = "https://thearchiveai.xyz";

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

function normalizeOrigin(value: string | undefined | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

function getConfiguredAppOrigin() {
  for (const origin of [
    normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL),
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL),
  ]) {
    if (origin && !isLocalOrigin(origin) && !isVercelOrigin(origin)) {
      return origin;
    }
  }

  return PRODUCTION_APP_ORIGIN;
}

function isLocalHost(host: string) {
  return LOCAL_HOST_PATTERN.test(host);
}

function isLocalOrigin(origin: string) {
  try {
    return isLocalHost(new URL(origin).host);
  } catch {
    return false;
  }
}

function isVercelOrigin(origin: string) {
  try {
    return new URL(origin).hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

export function getClientAppOrigin() {
  if (typeof window !== "undefined" && window.location.origin) {
    const currentOrigin = normalizeOrigin(window.location.origin);
    if (currentOrigin && isLocalOrigin(currentOrigin)) {
      return currentOrigin;
    }

    return getConfiguredAppOrigin();
  }

  return getConfiguredAppOrigin();
}

export function getRequestOrigin(request: Request) {
  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
  const host = forwardedHost ?? firstHeaderValue(request.headers.get("host"));

  if (host) {
    const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"));
    const protocol = forwardedProto ?? (isLocalHost(host) ? "http" : "https");

    const requestOrigin = `${protocol}://${host}`;
    if (isLocalHost(host)) {
      return requestOrigin;
    }
  }

  return getConfiguredAppOrigin();
}

export function getSafeRedirectPath(value: string | null, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}
