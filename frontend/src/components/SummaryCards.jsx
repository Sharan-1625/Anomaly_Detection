import React from "react";
import { Database, CheckCircle2, AlertTriangle, AlertOctagon, Flame } from "lucide-react";

export default function SummaryCards({ summary }) {
  const cards = [
    {
      title: "Total Logs Processed",
      value: summary?.total_logs || 0,
      icon: Database,
      color: "#007074",
      bgColor: "#E6F4F4",
      subtext: "HDFS Block Traces"
    },
    {
      title: "Normal Events",
      value: summary?.normal_events || 0,
      icon: CheckCircle2,
      color: "#16A34A",
      bgColor: "#DCFCE7",
      subtext: "Operating normally"
    },
    {
      title: "Anomalies Detected",
      value: summary?.anomalies_detected || 0,
      icon: AlertTriangle,
      color: "#F38C79",
      bgColor: "#FFC1B4",
      subtext: "Exceeded threshold"
    },
    {
      title: "High Severity Alerts",
      value: summary?.high_alerts || 0,
      icon: AlertOctagon,
      color: "#EA580C",
      bgColor: "#FFEDD5",
      subtext: "Score 61 - 80"
    },
    {
      title: "Critical Alerts",
      value: summary?.critical_alerts || 0,
      icon: Flame,
      color: "#DC2626",
      bgColor: "#FEE2E2",
      subtext: "Score 81 - 100"
    }
  ];

  return (
    <div className="grid-5" style={{ marginBottom: "24px" }}>
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="card" style={{ borderTop: `4px solid ${c.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "4px" }}>
                  {c.title}
                </p>
                <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-primary-dark)", margin: 0 }}>
                  {c.value.toLocaleString()}
                </h3>
              </div>
              <div style={{
                backgroundColor: c.bgColor,
                padding: "10px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Icon size={22} color={c.color} />
              </div>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "8px" }}>
              {c.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
