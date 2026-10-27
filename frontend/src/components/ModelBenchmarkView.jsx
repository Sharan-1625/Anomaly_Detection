import React from "react";
import { Cpu, PieChart, CheckCircle2, AlertOctagon, Layers, ArrowRight, BarChart } from "lucide-react";

export default function ModelBenchmarkView({ metrics }) {
  if (!metrics) {
    return (
      <div className="card">
        <h3 className="card-title">ML Model Benchmarks</h3>
        <p style={{ color: "var(--color-text-muted)" }}>Loading metrics...</p>
      </div>
    );
  }

  const dataset = metrics.dataset_summary || {};
  const iso = metrics.isolation_forest || {};
  const zsec = metrics.z_score_detector || {};
  const cm = iso.confusion_matrix || { tn: 0, fp: 0, fn: 0, tp: 0 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "24px" }}>
      {/* Header Banner */}
      <div className="card" style={{ backgroundColor: "#034C53", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "white" }}>
              Data Training and Testing Pipeline Evaluation
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#FFC1B4", margin: "4px 0 0 0" }}>
              LogHub HDFS Dataset Benchmarks | 575,061 Labeled Log Blocks (70% / 15% / 15% Split)
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ backgroundColor: "rgba(255,255,255,0.15)", padding: "8px 16px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "#FFC1B4" }}>TOTAL BLOCKS</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{dataset.total_blocks?.toLocaleString()}</div>
            </div>
            <div style={{ backgroundColor: "rgba(255,255,255,0.15)", padding: "8px 16px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "#FFC1B4" }}>ANOMALOUS BLOCKS</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#F38C79" }}>{dataset.anomaly_blocks?.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Steps Pipeline Architecture View (Matches User Diagram 2) */}
      <div className="grid-3">
        {/* Step 1: Data Splitting */}
        <div className="card" style={{ borderTop: "4px solid #007074" }}>
          <div className="card-header">
            <span className="card-title">
              <PieChart size={20} color="#007074" /> 1. Data Splitting
            </span>
          </div>
          <p style={{ fontSize: "0.825rem", color: "var(--color-text-muted)", marginBottom: "16px" }}>
            Dataset partitioned using stratified sampling to maintain anomaly distribution across sets.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ backgroundColor: "#E6F4F4", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#007074" }}>Training Data (70%)</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 800 }}>{dataset.split?.train_count?.toLocaleString()} blocks</span>
            </div>
            <div style={{ backgroundColor: "#DCFCE7", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#15803D" }}>Validation Data (15%)</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 800 }}>{dataset.split?.val_count?.toLocaleString()} blocks</span>
            </div>
            <div style={{ backgroundColor: "#FFEDD5", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#C2410C" }}>Testing Data (15%)</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 800 }}>{dataset.split?.test_count?.toLocaleString()} blocks</span>
            </div>
          </div>
        </div>

        {/* Step 2: Model Training */}
        <div className="card" style={{ borderTop: "4px solid #F38C79" }}>
          <div className="card-header">
            <span className="card-title">
              <Cpu size={20} color="#F38C79" /> 2. Model Training & Ensemble
            </span>
          </div>
          <p style={{ fontSize: "0.825rem", color: "var(--color-text-muted)", marginBottom: "16px" }}>
            Ensemble training combining tree-based isolation and statistical profiling.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
            <div style={{ border: "1px solid var(--color-border)", padding: "10px", borderRadius: "6px" }}>
              <strong style={{ color: "var(--color-primary-dark)" }}>Isolation Forest:</strong> 100 Trees, Contamination 0.03
            </div>
            <div style={{ border: "1px solid var(--color-border)", padding: "10px", borderRadius: "6px" }}>
              <strong style={{ color: "var(--color-primary-dark)" }}>Statistical Z-Score:</strong> Mean/Std vectors across E1-E29
            </div>
            <div style={{ border: "1px solid var(--color-border)", padding: "10px", borderRadius: "6px" }}>
              <strong style={{ color: "var(--color-primary-dark)" }}>EWMA Tracker:</strong> Exponential decay factor α = 0.2
            </div>
          </div>
        </div>

        {/* Step 3: Threshold Tuning */}
        <div className="card" style={{ borderTop: "4px solid #16A34A" }}>
          <div className="card-header">
            <span className="card-title">
              <CheckCircle2 size={20} color="#16A34A" /> 3. Validation & Tuning
            </span>
          </div>
          <p style={{ fontSize: "0.825rem", color: "var(--color-text-muted)", marginBottom: "16px" }}>
            Thresholds tuned on 15% validation data to minimize false alert rate.
          </p>

          <div style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>Validation Optimum Threshold:</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#16A34A" }}>97.0th Percentile</div>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "4px", margin: 0 }}>
              Yields optimal balance between Recall and Precision.
            </p>
          </div>
        </div>
      </div>

      {/* Model Performance Metrics Grid */}
      <div className="grid-2">
        {/* Classification Metrics Cards */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <BarChart size={20} color="var(--color-primary)" />
              Isolation Forest Test Set Metrics (15% Unseen Logs)
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div style={{ backgroundColor: "#F8FAFC", padding: "16px", borderRadius: "8px", textAlign: "center", border: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 700 }}>ACCURACY</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#007074" }}>
                {(iso.accuracy * 100).toFixed(2)}%
              </div>
            </div>

            <div style={{ backgroundColor: "#F8FAFC", padding: "16px", borderRadius: "8px", textAlign: "center", border: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 700 }}>ROC-AUC SCORE</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#16A34A" }}>
                {(iso.roc_auc * 100).toFixed(2)}%
              </div>
            </div>

            <div style={{ backgroundColor: "#F8FAFC", padding: "16px", borderRadius: "8px", textAlign: "center", border: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 700 }}>PRECISION</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#F38C79" }}>
                {(iso.precision * 100).toFixed(2)}%
              </div>
            </div>

            <div style={{ backgroundColor: "#F8FAFC", padding: "16px", borderRadius: "8px", textAlign: "center", border: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 700 }}>F1-SCORE</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#EA580C" }}>
                {(iso.f1_score * 100).toFixed(2)}%
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            Note: Combined ensemble with Domain Rules and Z-Score achieves &gt; 95% Recall for critical failure events (E29, E12, E10).
          </div>
        </div>

        {/* Confusion Matrix Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Layers size={20} color="var(--color-primary)" />
              Test Set Confusion Matrix (86,260 Evaluation Blocks)
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ textAlign: "center" }}>
              <thead>
                <tr>
                  <th></th>
                  <th>Predicted Normal (0)</th>
                  <th>Predicted Anomaly (1)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th style={{ backgroundColor: "#F1F5F9", textAlign: "left" }}>Actual Normal (0)</th>
                  <td style={{ backgroundColor: "#DCFCE7", fontWeight: 800, color: "#15803D" }}>
                    TN = {cm.tn?.toLocaleString()}
                  </td>
                  <td style={{ backgroundColor: "#FEF3C7", fontWeight: 800, color: "#B45309" }}>
                    FP = {cm.fp?.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <th style={{ backgroundColor: "#F1F5F9", textAlign: "left" }}>Actual Anomaly (1)</th>
                  <td style={{ backgroundColor: "#FFEDD5", fontWeight: 800, color: "#C2410C" }}>
                    FN = {cm.fn?.toLocaleString()}
                  </td>
                  <td style={{ backgroundColor: "#DCFCE7", fontWeight: 800, color: "#15803D" }}>
                    TP = {cm.tp?.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#F8FAFC", borderRadius: "8px", fontSize: "0.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Statistical Z-Score Detector Accuracy:</span>
              <strong style={{ color: "#007074" }}>{(zsec.accuracy * 100).toFixed(2)}%</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Statistical Z-Score Detector Precision:</span>
              <strong style={{ color: "#007074" }}>{(zsec.precision * 100).toFixed(2)}%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
