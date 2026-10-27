import React, { useState } from "react";
import { Search, Eye, Filter, AlertTriangle, CheckCircle, ShieldAlert, X } from "lucide-react";

export default function RecentAlertsTable({ alerts, onSelectAlert, activeAlertId }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedModalAlert, setSelectedModalAlert] = useState(null);

  const filteredAlerts = (alerts || []).filter(a => {
    if (filter !== "all" && a.severity.toLowerCase() !== filter.toLowerCase()) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        a.alert_id?.toLowerCase().includes(q) ||
        a.block_id?.toLowerCase().includes(q) ||
        a.anomaly_type?.toLowerCase().includes(q) ||
        a.affected_module?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSeverityBadgeClass = (sev) => {
    switch (sev.toLowerCase()) {
      case "low": return "badge badge-low";
      case "medium": return "badge badge-medium";
      case "high": return "badge badge-high";
      case "critical": return "badge badge-critical";
      default: return "badge";
    }
  };

  return (
    <div className="card" style={{ marginBottom: "24px" }}>
      <div className="card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
        <span className="card-title">
          <ShieldAlert size={22} color="var(--color-primary)" />
          Recent Detected System Anomalies & Alert Log
        </span>

        {/* Search and Filters */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Search Box */}
          <div style={{ position: "relative" }}>
            <Search size={16} color="var(--color-text-muted)" style={{ position: "absolute", left: "10px", top: "10px" }} />
            <input
              type="text"
              placeholder="Search alert, module, block..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "8px 12px 8px 32px",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
                fontSize: "0.85rem",
                outline: "none",
                width: "220px"
              }}
            />
          </div>

          {/* Severity Filter Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Filter size={16} color="var(--color-text-muted)" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
                fontSize: "0.85rem",
                backgroundColor: "white",
                cursor: "pointer"
              }}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical (81-100)</option>
              <option value="high">High (61-80)</option>
              <option value="medium">Medium (31-60)</option>
              <option value="low">Low (0-30)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Alert ID</th>
              <th>Timestamp</th>
              <th>Block ID</th>
              <th>Alert Score</th>
              <th>Severity</th>
              <th>Anomaly Type</th>
              <th>Affected Module</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "24px", color: "var(--color-text-muted)" }}>
                  No alerts match the selected search/severity filter.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alt, idx) => (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: activeAlertId === alt.block_id ? "#FFF8F6" : "transparent"
                  }}
                >
                  <td style={{ fontWeight: 700, fontFamily: "monospace", color: "var(--color-primary-dark)" }}>
                    {alt.alert_id}
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                    {alt.timestamp}
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.825rem" }}>
                    {alt.block_id}
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                      {alt.alert_score}
                    </span>{" "}
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>/100</span>
                  </td>
                  <td>
                    <span className={getSeverityBadgeClass(alt.severity)}>
                      {alt.severity}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {alt.anomaly_type}
                  </td>
                  <td style={{ color: "var(--color-primary)" }}>
                    {alt.affected_module}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => onSelectAlert(alt)}
                        className="btn btn-outline"
                        style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                        title="Set as Active Panel View"
                      >
                        Active
                      </button>
                      <button
                        onClick={() => setSelectedModalAlert(alt)}
                        className="btn btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                        title="View Full Technical Details"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Alert Detail Modal */}
      {selectedModalAlert && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            maxWidth: "700px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "24px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ShieldAlert size={24} color="var(--color-coral)" />
                <div>
                  <h3 style={{ margin: 0, color: "var(--color-primary-dark)" }}>
                    Alert Detail: {selectedModalAlert.alert_id}
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                    {selectedModalAlert.timestamp} | Block: {selectedModalAlert.block_id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedModalAlert(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 700 }}>ALERT SCORE</div>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--color-coral)" }}>
                  {selectedModalAlert.alert_score} <span style={{ fontSize: "1rem", color: "var(--color-text-muted)" }}>/ 100</span>
                </div>
              </div>
              <div style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 700 }}>SEVERITY LEVEL</div>
                <div style={{ marginTop: "4px" }}>
                  <span className={getSeverityBadgeClass(selectedModalAlert.severity)}>
                    {selectedModalAlert.severity}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ fontSize: "0.9rem", color: "var(--color-primary-dark)", marginBottom: "4px" }}>Affected Subsystem:</h4>
              <p style={{ fontWeight: 700, color: "var(--color-primary)" }}>{selectedModalAlert.affected_module}</p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ fontSize: "0.9rem", color: "var(--color-primary-dark)", marginBottom: "4px" }}>Human-Readable Explanation:</h4>
              <p style={{ backgroundColor: "#FFF8F6", padding: "12px", borderRadius: "6px", fontSize: "0.9rem", borderLeft: "4px solid var(--color-coral)" }}>
                {selectedModalAlert.explanation}
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ fontSize: "0.9rem", color: "var(--color-primary-dark)", marginBottom: "4px" }}>Recommended Action for SREs:</h4>
              <p style={{ backgroundColor: "#F0FDF4", padding: "12px", borderRadius: "6px", fontSize: "0.9rem", borderLeft: "4px solid #16A34A", color: "#166534" }}>
                {selectedModalAlert.recommended_action}
              </p>
            </div>

            <div style={{ textAlign: "right", marginTop: "20px" }}>
              <button onClick={() => setSelectedModalAlert(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
