import { Readable } from "node:stream";

export async function readFormData(req) {
  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : Readable.toWeb(req);

  const request = new Request(`http://local${req.url || "/"}`, {
    method: req.method,
    headers: req.headers,
    body,
    duplex: "half",
  });

  return request.formData();
}
