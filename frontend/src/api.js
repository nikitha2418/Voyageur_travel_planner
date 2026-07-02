// Thin API client for the FastAPI backend. Same-origin "/api" is proxied
// to the backend by Vite (dev) or nginx (Docker).
const BASE = "/api";

async function handle(res) {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || JSON.stringify(body);
    } catch (_) {
      /* ignore non-JSON error bodies */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  health: () => fetch(`${BASE}/health`).then(handle),

  generateTrip: (payload) =>
    fetch(`${BASE}/trips/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle),

  listTrips: () => fetch(`${BASE}/trips`).then(handle),

  getTrip: (id) => fetch(`${BASE}/trips/${id}`).then(handle),

  updateTrip: (id, patch) =>
    fetch(`${BASE}/trips/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).then(handle),

  deleteTrip: (id) =>
    fetch(`${BASE}/trips/${id}`, { method: "DELETE" }).then(handle),
};
