export type CustomRequestHeader = {
  name: string;
  value: string;
};

const TOKEN_RE = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]{1,128}$/;
const MAX_VALUE_LENGTH = 4096;

const BLOCKED_HEADER_NAMES = new Set<string>([
  // Forbidden / connection-control headers
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
  "upgrade",
  "cookie",
  "origin",
  "referer",
  "te",
  "trailer",
  "expect",
  "date",
  "via",
  // Authentication / security
  "authorization",
  "www-authenticate",
  "proxy-authorization",
  // Bitwarden-owned
  "device-type",
  "device-identifier",
  "bitwarden-client-name",
  "bitwarden-client-version",
  "bitwarden-package-type",
  "is-prerelease",
  // Commonly managed by the client
  "user-agent",
  "accept",
  "content-type",
  "cache-control",
  "pragma",
]);

export function isAllowedCustomHeaderName(name: string): boolean {
  if (typeof name !== "string" || !TOKEN_RE.test(name)) {
    return false;
  }
  const lower = name.toLowerCase();
  if (BLOCKED_HEADER_NAMES.has(lower)) {
    return false;
  }
  if (lower.startsWith("proxy-") || lower.startsWith("sec-")) {
    return false;
  }
  return true;
}

export function isAllowedCustomHeaderValue(value: string): boolean {
  if (typeof value !== "string") {
    return false;
  }
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > MAX_VALUE_LENGTH) {
    return false;
  }
  // Printable ASCII only; rejects CR/LF/NUL and all control chars (header injection).
  return /^[\x20-\x7E]+$/.test(trimmed);
}

export type HeaderValidationResult =
  | { valid: true; header: CustomRequestHeader }
  | { valid: false; reason: "name" | "value" | "incomplete" };

export function validateCustomRequestHeader(
  header: Partial<CustomRequestHeader> | null | undefined,
): HeaderValidationResult {
  const name = (header?.name ?? "").trim();
  const value = header?.value ?? "";

  if (name === "" && value.trim() === "") {
    return { valid: false, reason: "incomplete" };
  }
  if (!isAllowedCustomHeaderName(name)) {
    return { valid: false, reason: "name" };
  }
  if (!isAllowedCustomHeaderValue(value)) {
    return { valid: false, reason: "value" };
  }
  return { valid: true, header: { name, value: value.trim() } };
}
