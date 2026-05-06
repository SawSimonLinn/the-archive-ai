const LOCAL_HOST_PATTERN = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;
const PRIVATE_IPV4_PATTERN =
  /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})$/;
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
    if (
      origin &&
      !isVercelOrigin(origin) &&
      (!isLocalDevOrigin(origin) || isDevelopmentRuntime())
    ) {
      return origin;
    }
  }

  return PRODUCTION_APP_ORIGIN;
}

function isLocalHost(host: string) {
  return LOCAL_HOST_PATTERN.test(host);
}

function getHostname(host: string) {
  try {
    return new URL(`http://${host}`).hostname;
  } catch {
    return host.split(":")[0] ?? host;
  }
}

function isPrivateNetworkHost(host: string) {
  return PRIVATE_IPV4_PATTERN.test(getHostname(host));
}

function isLocalOrigin(origin: string) {
  try {
    return isLocalHost(new URL(origin).host);
  } catch {
    return false;
  }
}

function isPrivateNetworkOrigin(origin: string) {
  try {
    return isPrivateNetworkHost(new URL(origin).host);
  } catch {
    return false;
  }
}

function isLocalDevOrigin(origin: string) {
  return isLocalOrigin(origin) || isPrivateNetworkOrigin(origin);
}

function isVercelOrigin(origin: string) {
  try {
    return new URL(origin).hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function isDevelopmentRuntime() {
  return process.env.NODE_ENV !== "production";
}

function shouldUseCurrentOrigin(origin: string) {
  if (isLocalDevOrigin(origin)) return true;
  if (isDevelopmentRuntime()) return true;

  return origin === getConfiguredAppOrigin();
}

export function getClientAppOrigin() {
  if (typeof window !== "undefined" && window.location.origin) {
    const currentOrigin = normalizeOrigin(window.location.origin);
    if (currentOrigin && shouldUseCurrentOrigin(currentOrigin)) {
      return currentOrigin;
    }
  }

  return getConfiguredAppOrigin();
}

export function getRequestOrigin(request: Request) {
  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
  const host = forwardedHost ?? firstHeaderValue(request.headers.get("host"));

  if (host) {
    const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"));
    const protocol = forwardedProto ?? (isLocalHost(host) || isPrivateNetworkHost(host) ? "http" : "https");

    const requestOrigin = normalizeOrigin(`${protocol}://${host}`);
    if (requestOrigin && shouldUseCurrentOrigin(requestOrigin)) {
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
