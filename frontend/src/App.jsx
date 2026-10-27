import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import SummaryCards from "./components/SummaryCards";
import AlertScoreGauge from "./components/AlertScoreGauge";
import ExplanationPanel from "./components/ExplanationPanel";
import ChartsSection from "./components/ChartsSection";
import RecentAlertsTable from "./components/RecentAlertsTable";
import ModelBenchmarkView from "./components/ModelBenchmarkView";
import LiveLogViewer from "./components/LiveLogViewer";
import {
  fetchStatus,
  fetchAlerts,
  fetchMetrics,
  fetchTemplates,
  startStream,
  stopStream,
  resetStream,
  ingestBlock,
  setThreshold
} from "./services/api";

export default function App() {
  const [statusData, setStatusData] = useState(null);
  const [alertsList, setAlertsList] = useState([]);
  const [metricsData, setMetricsData] = useState(null);
  const [templatesData, setTemplatesData] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'alerts', 'benchmarks', 'logs'
  
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [threshold, setThresholdState] = useState(60);

  // Poll backend status every 2 seconds
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        const statusRes = await fetchStatus();
        if (!isMounted) return;
        setStatusData(statusRes);
        setThresholdState(statusRes.alert_threshold || 60);

        if (!selectedAlert && statusRes.current_active_alert) {
          setSelectedAlert(statusRes.current_active_alert);
        }

        const alertsRes = await fetchAlerts();
        if (!isMounted) return;
        setAlertsList(alertsRes.alerts || []);
      } catch (err) {
        console.error("Error fetching status from API:", err);
      }
    };

    loadData();
    const interval = setInterval(loadData, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Fetch metrics and templates once on load
  useEffect(() => {
    fetchMetrics().then(setMetricsData).catch(console.error);
    fetchTemplates().then(setTemplatesData).catch(console.error);
  }, []);

  const handleToggleStream = async () => {
    if (statusData?.stream_active) {
      await stopStream();
    } else {
      await startStream();
    }
    const s = await fetchStatus();
    setStatusData(s);
  };

  const handleResetStream = async () => {
    await resetStream();
    const s = await fetchStatus();
    setStatusData(s);
    setSelectedAlert(null);
  };

  const handleIngestBlock = async (type = "anomaly") => {
    const res = await ingestBlock(type);
    setSelectedAlert(res);
    const s = await fetchStatus();
    setStatusData(s);
  };

  const handleThresholdChange = async (val) => {
    setThresholdState(val);
    await setThreshold(val);
    const s = await fetchStatus();
    setStatusData(s);
  };

  const activeAlertToDisplay = selectedAlert || statusData?.current_active_alert;

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        status={statusData}
        onToggleStream={handleToggleStream}
        onResetStream={handleResetStream}
        onIngestBlock={handleIngestBlock}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main style={{ maxWidth: "1400px", width: "100%", margin: "0 auto", padding: "0 24px 40px 24px" }}>
        {/* Top Summary Cards always visible */}
        <SummaryCards summary={statusData?.summary} />

        {/* Tab 1: Dashboard View */}
        {activeTab === "dashboard" && (
          <>
            {/* Upper Grid: Alert Score Gauge & Explanation Panel side-by-side */}
            <div className="grid-2" style={{ marginBottom: "24px" }}>
              <AlertScoreGauge
                alert={activeAlertToDisplay}
                threshold={threshold}
                onThresholdChange={handleThresholdChange}
              />
              <ExplanationPanel alert={activeAlertToDisplay} />
            </div>

            {/* Middle Section: Real-Time Charts */}
            <ChartsSection
              trends={statusData?.trends}
              alert={activeAlertToDisplay}
              summary={statusData?.summary}
            />

            {/* Lower Section: Recent Alerts Table */}
            <RecentAlertsTable
              alerts={alertsList}
              onSelectAlert={setSelectedAlert}
              activeAlertId={activeAlertToDisplay?.block_id}
            />
          </>
        )}

        {/* Tab 2: Alert History View */}
        {activeTab === "alerts" && (
          <RecentAlertsTable
            alerts={alertsList}
            onSelectAlert={setSelectedAlert}
            activeAlertId={activeAlertToDisplay?.block_id}
          />
        )}

        {/* Tab 3: Model Benchmarks View (70/15/15 Data Training & Testing Steps) */}
        {activeTab === "benchmarks" && (
          <ModelBenchmarkView metrics={metricsData} />
        )}

        {/* Tab 4: Live Log Stream View */}
        {activeTab === "logs" && (
          <LiveLogViewer logs={statusData?.recent_logs} templates={templatesData} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: "#034C53",
        color: "#FFC1B4",
        textAlign: "center",
        padding: "16px",
        marginTop: "auto",
        fontSize: "0.825rem"
      }}>
        A Lightweight Explainable Anomaly Detection Framework for Software Systems | Built with React.js & Python Flask
      </footer>
    </div>
  );
}
