const defaultApiBaseUrl = "http://localhost:8787";

export function getServerApiBaseUrl() {
  return process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultApiBaseUrl;
}

export function getClientApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultApiBaseUrl;
}
