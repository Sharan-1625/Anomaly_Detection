import React from "react";
import { Gauge, ShieldAlert, Cpu, Layers } from "lucide-react";

export default function AlertScoreGauge({ alert, threshold, onThresholdChange }) {
  if (!alert) {
    return (
      <div className="card">
        <h3 className="card-title"><Gauge size={20} /> Current Alert Score</h3>
        <p style={{ color: "var(--color-text-muted)" }}>Waiting for incoming block logs...</p>
      </div>
    );
  }

  const score = alert.alert_score || 0;
  const severity = alert.severity || "Low";
  
  // Severity color mapping
  const getSeverityColor = (sev) => {
    switch (sev.toLowerCase()) {
      case "low": return { bg: "#DCFCE7", text: "#15803D", border: "#BBF7D0", hex: "#16A34A" };
      case "medium": return { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A", hex: "#F59E0B" };
      case "high": return { bg: "#FFEDD5", text: "#C2410C", border: "#FDBA74", hex: "#EA580C" };
      case "critical": return { bg: "#FEE2E2", text: "#B91C1C", border: "#FCA5A5", hex: "#DC2626" };
      default: return { bg: "#F1F5F9", text: "#0F172A", border: "#CBD5E1", hex: "#007074" };
    }
  };

  const sevTheme = getSeverityColor(severity);
  const methods = alert.detection_methods || {};

  return (
    <div className="card" style={{ borderLeft: `6px solid ${sevTheme.hex}` }}>
      <div className="card-header">
        <span className="card-title">
          <Gauge size={22} color="var(--color-primary)" />
          Alert Score & Severity Gauge
        </span>
        <div className="badge" style={{ backgroundColor: sevTheme.bg, color: sevTheme.text, border: `1px solid ${sevTheme.border}`, fontSize: "0.85rem", padding: "6px 14px" }}>
          <ShieldAlert size={16} />
          SEVERITY: {severity.toUpperCase()}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px", alignItems: "center" }}>
        {/* Score Dial / Visual */}
        <div style={{ textAlign: "center", position: "relative", padding: "16px" }}>
          <div style={{
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            background: `conic-gradient(${sevTheme.hex} 0% ${score}%, #E2E8F0 ${score}% 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              width: "108px",
              height: "108px",
              borderRadius: "50%",
              backgroundColor: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <span style={{ fontSize: "2.2rem", fontWeight: 900, color: sevTheme.hex, lineHeight: 1 }}>
                {score}
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600 }}>
                OUT OF 100
              </span>
            </div>
          </div>
          <div style={{ marginTop: "12px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Block ID: </span>
            <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--color-primary-dark)" }}>
              {alert.block_id}
            </span>
          </div>
        </div>

        {/* Breakdown by detection methods */}
        <div>
          <h4 style={{ fontSize: "0.9rem", color: "var(--color-primary-dark)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Layers size={16} /> Ensemble Score Component Breakdown
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Isolation Forest Score */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                <span>Isolation Forest ML Model</span>
                <span style={{ fontWeight: 700 }}>{methods.isolation_forest_score || 0} / 100</span>
              </div>
              <div style={{ height: "6px", backgroundColor: "#E2E8F0", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${methods.isolation_forest_score || 0}%`, height: "100%", backgroundColor: "#007074" }} />
              </div>
            </div>

            {/* Z-Score Statistical Score */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                <span>Statistical Z-Score Deviation (Max: {methods.z_max_val || 0}σ)</span>
                <span style={{ fontWeight: 700 }}>{methods.z_score || 0} / 100</span>
              </div>
              <div style={{ height: "6px", backgroundColor: "#E2E8F0", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${methods.z_score || 0}%`, height: "100%", backgroundColor: "#F38C79" }} />
              </div>
            </div>

            {/* EWMA Score */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                <span>EWMA Sequence Drift Tracker</span>
                <span style={{ fontWeight: 700 }}>{methods.ewma_score || 0} / 100</span>
              </div>
              <div style={{ height: "6px", backgroundColor: "#E2E8F0", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${methods.ewma_score || 0}%`, height: "100%", backgroundColor: "#F59E0B" }} />
              </div>
            </div>

            {/* Rule Engine Penalty */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                <span>Domain Rule Engine Weight</span>
                <span style={{ fontWeight: 700 }}>{methods.rule_engine_score || 0} / 100</span>
              </div>
              <div style={{ height: "6px", backgroundColor: "#E2E8F0", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${methods.rule_engine_score || 0}%`, height: "100%", backgroundColor: "#DC2626" }} />
              </div>
            </div>
          </div>

          {/* Configurable Threshold Slider */}
          <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--color-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "6px" }}>
              <span style={{ fontWeight: 600, color: "var(--color-primary-dark)" }}>Alert Trigger Threshold:</span>
              <span style={{ fontWeight: 700, color: "var(--color-coral)" }}>{threshold} / 100</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={threshold}
              onChange={(e) => onThresholdChange(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--color-coral)", cursor: "pointer" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
