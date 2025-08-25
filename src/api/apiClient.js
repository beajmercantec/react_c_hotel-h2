const API_URL = import.meta.env?.VITE_API_URL;

if (!API_URL) throw new Error("Manglende VITE_API_URL i miljøet");
const TOKEN_KEY = "access_token";

export function getToken()   { return localStorage.getItem(TOKEN_KEY); }
export function setToken(t)  { localStorage.setItem(TOKEN_KEY, t); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }

export function buildQuery(params) {
  if (!params) return "";
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v == null) return;
    Array.isArray(v) ? v.forEach(x => usp.append(k, x)) : usp.append(k, v);
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function request(path, opts = {}) {
  const {
    method="GET",
    params,
    json,
    formData,
    auth=false,
    headers={},
    timeoutMs=15000,
    retry=0,
    retryDelayBase=300,
    signal: external,
  } = opts;

  const url = API_URL + path + buildQuery(params);
  const h = new Headers(headers);
  let body;

  if (auth) {
    const token = getToken();
    if (token) h.set("Authorization", `Bearer ${token}`);
  }
  if (json !== undefined) {
    h.set("Content-Type", "application/json");
    body = JSON.stringify(json);
  } else if (formData instanceof FormData) {
    body = formData; // lad browseren sætte boundary
  }

  const controller = new AbortController();
  const timeoutId  = setTimeout(
    () => controller.abort(new DOMException("Timeout", "AbortError")),
    timeoutMs
  );
  if (external) external.addEventListener("abort", () => controller.abort());

  let attempt = 0;
  while (true) {
    try {
      const res = await fetch(url, { method, headers: h, body, signal: controller.signal });
      clearTimeout(timeoutId);

      const ct = res.headers.get("content-type") || "";
      const isJson = ct.includes("application/json");

      if (!res.ok) {
        let payload;
        try { 
               payload = isJson ? await res.json() : await res.text(); 
            } 
            catch {
                  throw err;
            }
        const err = new Error(`HTTP ${res.status}`);
        err.status = res.status; err.payload = payload;

        // enkel retry-politik
        if (retry > 0 && (res.status === 429 || res.status >= 500)) {
          attempt++;
          const backoff = Math.round(retryDelayBase * 2 ** (attempt - 1));
          await sleep(backoff);
          if (attempt <= retry) continue;
        }
        throw err;
      }

      if (res.status === 204) return null;
      if (isJson) return await res.json();
      return await res.blob(); // fx downloads

    } catch (e) {
      if (e.name === "AbortError") {
        const err = new Error("Forespørgslen blev afbrudt.");
        err.aborted = true;
        throw err;
      }
      // netværksfejl → forsøg retry
      if (retry > 0) {
        attempt++;
        const backoff = Math.round(retryDelayBase * 2 ** (attempt - 1));
        await sleep(backoff);
        if (attempt <= retry) continue;
      }
      throw e;
    }
  }
}

// shortcuts
export const api = {
  get:   (p, o={})         => request(p, { ...o, method:"GET" }),
  post:  (p, json, o={})   => request(p, { ...o, method:"POST",  json }),
  put:   (p, json, o={})   => request(p, { ...o, method:"PUT",   json }),
  patch: (p, json, o={})   => request(p, { ...o, method:"PATCH", json }),
  del:   (p, o={})         => request(p, { ...o, method:"DELETE" }),
  upload:(p, formData, o={}) => request(p, { ...o, method:"POST", formData }),
};