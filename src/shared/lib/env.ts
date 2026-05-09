const API_BASE_URL_ENV = "AQUAGAS_API_BASE_URL";

function normalizeUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  const value = process.env[API_BASE_URL_ENV];

  if (!value) {
    throw new Error(`Missing environment variable: ${API_BASE_URL_ENV}`);
  }

  return normalizeUrl(value);
}
