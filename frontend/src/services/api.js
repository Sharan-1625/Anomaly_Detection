const API_BASE = "http://127.0.0.1:5000/api";

export async function fetchStatus() {
  const res = await fetch(`${API_BASE}/status`);
  return res.json();
}

export async function fetchAlerts(severity = "all", search = "") {
  const res = await fetch(`${API_BASE}/alerts?severity=${severity}&search=${encodeURIComponent(search)}`);
  return res.json();
}

export async function fetchMetrics() {
  const res = await fetch(`${API_BASE}/metrics`);
  return res.json();
}

export async function fetchTemplates() {
  const res = await fetch(`${API_BASE}/templates`);
  return res.json();
}

export async function startStream() {
  const res = await fetch(`${API_BASE}/stream/start`, { method: "POST" });
  return res.json();
}

export async function stopStream() {
  const res = await fetch(`${API_BASE}/stream/stop`, { method: "POST" });
  return res.json();
}

export async function resetStream() {
  const res = await fetch(`${API_BASE}/stream/reset`, { method: "POST" });
  return res.json();
}

export async function ingestBlock(type = "random") {
  const res = await fetch(`${API_BASE}/stream/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type })
  });
  return res.json();
}

export async function setThreshold(threshold) {
  const res = await fetch(`${API_BASE}/threshold`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ threshold })
  });
  return res.json();
}

export async function evaluateCustom(blockId, eventCounts) {
  const res = await fetch(`${API_BASE}/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ block_id: blockId, event_counts: eventCounts })
  });
  return res.json();
}
