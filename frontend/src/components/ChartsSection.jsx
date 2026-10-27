import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { TrendingUp, BarChart2, PieChart as PieIcon, Activity } from "lucide-react";

export default function ChartsSection({ trends, alert, summary }) {
  // Severity Distribution Data
  const pieData = [
    { name: "Normal", value: summary?.normal_events || 0, color: "#16A34A" },
    { name: "High Severity", value: summary?.high_alerts || 0, color: "#EA580C" },
    { name: "Critical Severity", value: summary?.critical_alerts || 0, color: "#DC2626" }
  ];

  // Active Alert Detection Method Bar Data
  const methods = alert?.detection_methods || {};
  const barData = [
    { name: "Isolation Forest", score: methods.isolation_forest_score || 0, color: "#007074" },
    { name: "Z-Score Stat", score: methods.z_score || 0, color: "#F38C79" },
    { name: "EWMA Drift", score: methods.ewma_score || 0, color: "#F59E0B" },
    { name: "Rule Engine", score: methods.rule_engine_score || 0, color: "#DC2626" }
  ];

  // Event Template Histogram Data (from active block)
  const activeEvents = alert?.active_events || [];
  const templateHistData = activeEvents.map(e => ({
    name: e.event_id,
    count: e.count
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "24px" }}>
      {/* Row 1: Anomaly Score Trend over Time */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <TrendingUp size={22} color="var(--color-primary)" />
            Real-Time Alert Score & Anomaly Trend
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            Live Time-Series Monitor
          </span>
        </div>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="time" stroke="#64748B" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#64748B" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: "#034C53", color: "white", borderRadius: "8px", border: "none" }}
              />
              <Line
                type="monotone"
                dataKey="score"
                name="Alert Score (0-100)"
                stroke="#F38C79"
                strokeWidth={3}
                dot={{ r: 4, fill: "#F38C79" }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Detection Method Comparison & Severity Distribution */}
      <div className="grid-2">
        {/* Method Breakdown Bar Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <BarChart2 size={20} color="var(--color-primary)" />
              Detection Method Score Contribution
            </span>
          </div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} interval={0} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#034C53", color: "white", borderRadius: "8px" }}
                />
                <Bar dataKey="score" name="Score Contribution" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Donut */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <PieIcon size={20} color="var(--color-primary)" />
              System Event Severity Distribution
            </span>
          </div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#034C53", color: "white", borderRadius: "8px" }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Active Block Event Template Histogram */}
      {templateHistData.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Activity size={20} color="var(--color-primary)" />
              Active Log Block Event Occurrences (Block {alert?.block_id})
            </span>
          </div>
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={templateHistData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "#034C53", color: "white", borderRadius: "8px" }} />
                <Bar dataKey="count" name="Event Frequency" fill="#007074" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
