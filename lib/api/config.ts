const localApiBaseUrl = "http://127.0.0.1:8787";
const productionApiBaseUrl = "https://luminote-api.bbing.xyz";

function getDefaultApiBaseUrl() {
  return process.env.NODE_ENV === "production"
    ? productionApiBaseUrl
    : localApiBaseUrl;
}

export function getServerApiBaseUrl() {
  return (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    getDefaultApiBaseUrl()
  );
}

export function getClientApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? getDefaultApiBaseUrl();
}
