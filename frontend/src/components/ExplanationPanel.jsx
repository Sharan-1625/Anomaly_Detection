import React from "react";
import { HelpCircle, Cpu, CheckSquare, FileText, AlertCircle, Sparkles } from "lucide-react";

export default function ExplanationPanel({ alert }) {
  if (!alert) {
    return (
      <div className="card">
        <h3 className="card-title"><HelpCircle size={20} /> Rule-Based Justification Engine</h3>
        <p style={{ color: "var(--color-text-muted)" }}>No alert selected for explanation.</p>
      </div>
    );
  }

  const matchedRules = alert.matched_rules || [];

  return (
    <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div className="card-header">
          <span className="card-title">
            <Sparkles size={22} color="var(--color-coral)" />
            Rule-Based Justification & Root Cause Analysis
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>
            {alert.timestamp}
          </span>
        </div>

        {/* Affected Module Badge */}
        <div style={{
          backgroundColor: "#F1F5F9",
          padding: "12px 16px",
          borderRadius: "8px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          border: "1px solid var(--color-border)"
        }}>
          <Cpu size={24} color="var(--color-primary)" />
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              AFFECTED SUBSYSTEM / MODULE
            </span>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-primary-dark)", margin: 0 }}>
              {alert.affected_module || "General HDFS Subsystem"}
            </h4>
          </div>
        </div>

        {/* Human-Readable Explanation */}
        <div style={{ marginBottom: "16px" }}>
          <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-primary-dark)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <FileText size={16} /> Explainable Justification (Why detected?)
          </h4>
          <div style={{
            backgroundColor: "#FFF8F6",
            borderLeft: "4px solid var(--color-coral)",
            padding: "12px 16px",
            borderRadius: "0 8px 8px 0",
            fontSize: "0.9rem",
            lineHeight: 1.5,
            color: "var(--color-text-main)"
          }}>
            {alert.explanation}
          </div>
        </div>

        {/* Matched Rules List */}
        {matchedRules.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-primary-dark)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertCircle size={16} color="var(--color-critical)" /> Matched Domain Rules ({matchedRules.length})
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {matchedRules.map((rule, idx) => (
                <div key={idx} style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  fontSize: "0.825rem"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "var(--color-primary-dark)", marginBottom: "2px" }}>
                    <span>{rule.name}</span>
                    <span style={{ color: "var(--color-critical)" }}>Weight +{rule.weight}</span>
                  </div>
                  <div style={{ color: "var(--color-text-muted)", fontFamily: "monospace" }}>
                    {rule.template}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggested Remedial Action */}
      <div style={{
        backgroundColor: "#F0FDF4",
        border: "1px solid #BBF7D0",
        borderRadius: "8px",
        padding: "14px 16px",
        marginTop: "12px"
      }}>
        <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#15803D", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
          <CheckSquare size={18} /> Recommended Remedial Action for SREs
        </h4>
        <p style={{ fontSize: "0.875rem", color: "#166534", margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
          {alert.recommended_action}
        </p>
      </div>
    </div>
  );
}
