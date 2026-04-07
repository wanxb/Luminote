export function json(data, init) {
    return new Response(JSON.stringify(data, null, 2), {
        ...init,
        headers: {
            "content-type": "application/json; charset=utf-8",
            ...(init?.headers ?? {})
        }
    });
}
