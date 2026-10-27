import React from "react";
import { Terminal, ShieldAlert, Cpu } from "lucide-react";

export default function LiveLogViewer({ logs, templates }) {
  const getTemplateText = (eventKey) => {
    if (!templates) return eventKey;
    const found = templates.find(t => t.event_id === eventKey);
    return found ? found.template : eventKey;
  };

  return (
    <div className="card" style={{ marginBottom: "24px" }}>
      <div className="card-header">
        <span className="card-title">
          <Terminal size={22} color="var(--color-primary)" />
          Live Real-Time HDFS Block Trace Stream
        </span>
        <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
          Showing recent {logs?.length || 0} parsed log block traces
        </span>
      </div>

      <div style={{
        backgroundColor: "#0F172A",
        color: "#F8FAFC",
        fontFamily: "'Courier New', Courier, monospace",
        padding: "16px",
        borderRadius: "8px",
        maxHeight: "500px",
        overflowY: "auto",
        fontSize: "0.825rem",
        lineHeight: 1.6
      }}>
        {(!logs || logs.length === 0) ? (
          <div style={{ color: "#64748B", textAlign: "center", padding: "20px" }}>
            Waiting for log stream ingestion...
          </div>
        ) : (
          logs.map((log, idx) => {
            const isAnomaly = log.alert_score >= 60.0;
            return (
              <div key={idx} style={{
                marginBottom: "12px",
                paddingBottom: "12px",
                borderBottom: "1px solid #1E293B",
                borderLeft: isAnomaly ? "4px solid #F38C79" : "4px solid #16A34A",
                paddingLeft: "10px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#94A3B8" }}>
                  <span>[{log.timestamp}] Block: <strong style={{ color: "#38BDF8" }}>{log.block_id}</strong></span>
                  <span>
                    Score: <strong style={{ color: isAnomaly ? "#F38C79" : "#4ADE80" }}>{log.alert_score}</strong> | {log.severity.toUpperCase()}
                  </span>
                </div>

                <div style={{ marginTop: "4px", color: isAnomaly ? "#FECACA" : "#E2E8F0" }}>
                  <strong>Type:</strong> {log.anomaly_type} | <strong>Module:</strong> {log.affected_module}
                </div>

                {/* Event Template Tags */}
                <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {(log.active_events || []).map((e, eIdx) => (
                    <span key={eIdx} style={{
                      backgroundColor: "#1E293B",
                      border: "1px solid #334155",
                      borderRadius: "4px",
                      padding: "2px 6px",
                      fontSize: "0.75rem",
                      color: e.event_id === "E29" || e.event_id === "E12" || e.event_id === "E10" || e.event_id === "E4" ? "#FCA5A5" : "#94A3B8"
                    }}>
                      <strong style={{ color: "#38BDF8" }}>{e.event_id}</strong>: {getTemplateText(e.event_id)} (x{e.count})
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
