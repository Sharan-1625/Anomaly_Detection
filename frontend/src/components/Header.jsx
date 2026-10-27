import React from "react";
import { Activity, Play, Pause, RotateCcw, AlertTriangle, ShieldAlert, Cpu } from "lucide-react";

export default function Header({ status, onToggleStream, onResetStream, onIngestBlock, activeTab, setActiveTab }) {
  const isStreaming = status?.stream_active;

  return (
    <header style={{
      backgroundColor: "#034C53",
      color: "white",
      padding: "16px 24px",
      boxShadow: "0 4px 12px rgba(0, 76, 83, 0.15)",
      marginBottom: "24px"
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        {/* Title and Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            backgroundColor: "#007074",
            padding: "10px",
            borderRadius: "10px",
            display: "flex"
          }}>
            <ShieldAlert size={28} color="#FFC1B4" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
              Software Anomaly Detection & Scoring Engine
            </h1>
            <p style={{ fontSize: "0.825rem", color: "#FFC1B4", margin: 0 }}>
              Real-Time Alert Scoring with Rule-Based Justification (HDFS Log Engine)
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "8px", backgroundColor: "#007074", padding: "4px", borderRadius: "8px" }}>
          <button
            onClick={() => setActiveTab("dashboard")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: activeTab === "dashboard" ? "#034C53" : "transparent",
              color: activeTab === "dashboard" ? "white" : "#FFC1B4",
              transition: "all 0.2s ease"
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: activeTab === "alerts" ? "#034C53" : "transparent",
              color: activeTab === "alerts" ? "white" : "#FFC1B4",
              transition: "all 0.2s ease"
            }}
          >
            Alert History
          </button>
          <button
            onClick={() => setActiveTab("benchmarks")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: activeTab === "benchmarks" ? "#034C53" : "transparent",
              color: activeTab === "benchmarks" ? "white" : "#FFC1B4",
              transition: "all 0.2s ease"
            }}
          >
            ML Benchmarks (70/15/15)
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: activeTab === "logs" ? "#034C53" : "transparent",
              color: activeTab === "logs" ? "white" : "#FFC1B4",
              transition: "all 0.2s ease"
            }}
          >
            Live Log Stream
          </button>
        </div>

        {/* Live Stream Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: isStreaming ? "rgba(22, 163, 74, 0.2)" : "rgba(245, 158, 11, 0.2)",
            color: isStreaming ? "#86EFAC" : "#FDE047",
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "0.8rem",
            fontWeight: 700,
            border: `1px solid ${isStreaming ? "#16A34A" : "#F59E0B"}`
          }}>
            <Activity size={16} className={isStreaming ? "pulse" : ""} />
            {isStreaming ? "STREAMING" : "PAUSED"}
          </div>

          <button
            onClick={onToggleStream}
            className="btn"
            style={{
              backgroundColor: isStreaming ? "#F38C79" : "#007074",
              color: "white",
              padding: "8px 14px"
            }}
            title={isStreaming ? "Pause Live Ingestion" : "Start Live Ingestion"}
          >
            {isStreaming ? <Pause size={16} /> : <Play size={16} />}
            {isStreaming ? "Pause" : "Start"}
          </button>

          <button
            onClick={() => onIngestBlock("anomaly")}
            className="btn"
            style={{ backgroundColor: "#F38C79", color: "white", padding: "8px 12px" }}
            title="Inject anomalous log block"
          >
            <AlertTriangle size={16} />
            + Anomaly
          </button>

          <button
            onClick={onResetStream}
            className="btn"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.15)", color: "white", padding: "8px 12px" }}
            title="Reset simulation counters"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
