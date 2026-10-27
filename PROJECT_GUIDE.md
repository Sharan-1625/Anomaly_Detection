# A Lightweight Explainable Anomaly Detection Framework for Software Systems
## Real-Time Alert Scoring with Rule-Based Justification

### 📌 Project Overview
This project implements an end-to-end lightweight, explainable real-time anomaly detection framework for large-scale software systems using the **LogHub HDFS Log Dataset** (575,061 labeled log blocks).

The framework continuously ingests software execution logs, extracts event occurrence vectors across 29 log templates (`E1` to `E29`), detects deviations using statistical techniques (**Z-Score**, **EWMA**) and machine learning (**Isolation Forest**), evaluates predefined **Domain Failure Rules**, generates a unified **0–100 Alert Score**, and provides **human-readable justifications with actionable remedial guidance** for SREs and developers.

---

### 🎨 Visual Theme & Color Palette
The frontend dashboard adheres strictly to the Color Hunt palette:
- **Deep Dark Teal**: `#034C53` (Header, navigation, dark accents)
- **Primary Teal**: `#007074` (Buttons, card headers, primary accents)
- **Coral Warning**: `#F38C79` (High severity indicators, score meter highlight)
- **Soft Peach**: `#FFC1B4` (Accent badges, subtle borders)
- **Light Gray Background**: `#F8FAFC`
- **Card Background**: `#FFFFFF`

---

### 🏛️ Pipeline Architecture & System Modules

```
1. DATA GENERATION & INGESTION
   ├── HDFS Log blocks & event templates (E1 to E29)
   └── Streaming background worker with controllable rate

2. STORAGE & PREPROCESSING
   ├── Feature vector extraction (E1-E29 occurrence counts per block)
   └── Stratified dataset partitioning (70% Train, 15% Val, 15% Test)

3. MULTI-MODEL ANOMALY DETECTION
   ├── Z-Score Statistical Detector: Normalized standard deviation from normal mean
   ├── EWMA Tracker (α = 0.2): Exponential moving average tracking sequence drift
   └── Isolation Forest ML Model: 100 Isolation Trees, contamination tuned on validation set

4. RULE EVALUATION ENGINE
   ├── Rule 1: Got exception while serving block (E4)
   ├── Rule 2: writeBlock received exception (E7)
   ├── Rule 3: PacketResponder for block Interrupted (E8)
   ├── Rule 4: PacketResponder Exception (E10)
   ├── Rule 5: Exception writing block to mirror DataNode (E12)
   ├── Rule 6: Receiving empty packet for block (E13)
   ├── Rule 7: Exception in receiveBlock for block (E14)
   ├── Rule 8: Failed to transfer block to target host (E17)
   ├── Rule 9: Unexpected error deleting block / VolumeMap missing (E20)
   ├── Rule 10: PendingReplicationMonitor timed out block (E29)
   └── Rule 11: Volume Spike (Total event count > 3x historical average)

5. UNIFIED SEVERITY SCORING (0 to 100)
   ├── Score Formula: 0.35 * ML_Score + 0.35 * Stat_Score + 0.30 * Rule_Score
   ├── 0  to 30 : LOW Severity
   ├── 31 to 60 : MEDIUM Severity
   ├── 61 to 80 : HIGH Severity
   └── 81 to 100: CRITICAL Severity

6. RULE-BASED EXPLANATION ENGINE
   ├── Identifies the root cause ("Why detected?")
   ├── Identifies the affected subsystem (e.g. Replication Mirror Pipeline, NameNode Monitor)
   └── Suggests clear remedial action for Site Reliability Engineers (SREs)

7. REAL-TIME MONITORING DASHBOARD (React.js)
   ├── Summary stat cards (Total Logs, Normal, Anomalies, High, Critical)
   ├── Alert score gauge & severity meter
   ├── Time series anomaly score trend (Recharts)
   ├── Filterable and searchable alerts table
   ├── Model training & evaluation benchmark view (70/15/15)
   └── Live log trace viewer with template highlighting
```

---

### 📊 Dataset Splitting & Benchmark Results

The model was evaluated using **70% Training**, **15% Validation**, and **15% Testing** split on 575,061 log blocks:

- **Total Blocks**: 575,061
- **Normal Blocks**: 558,223 (97.07%)
- **Anomalous Blocks**: 16,838 (2.93%)
- **Training Set (70%)**: 402,542 blocks
- **Validation Set (15%)**: 86,259 blocks
- **Testing Set (15%)**: 86,260 blocks

#### Test Set Evaluation (Unseen Data):
- **Accuracy**: 98.26%
- **ROC-AUC**: 95.75%
- **Precision**: 76.45%
- **Recall**: 58.59%
- **F1-Score**: 66.34%
- **Confusion Matrix**:
  - True Negatives (TN): 83,278
  - False Positives (FP): 456
  - False Negatives (FN): 1,046
  - True Positives (TP): 1,480

---

### 🚀 Running the Project

#### 1. Start Backend & Unified Web Server
```powershell
python app.py
```
The server will start listening at:
👉 **http://127.0.0.1:5000**

#### 2. Re-training Models (Optional)
```powershell
python train_and_eval.py
```

#### 3. Re-building the React Frontend (Optional)
```powershell
cd frontend
npm run build
```

---

### 🎯 Viva & Presentation Cheat Sheet

- **Q: What is the main objective of this project?**  
  *A:* To build a lightweight, explainable anomaly detection framework for software systems that calculates a unified 0–100 alert score and explains *why* the alert was triggered using domain failure rules.

- **Q: Why combine Machine Learning and Rule Evaluation?**  
  *A:* Machine learning (Isolation Forest) is effective at finding hidden outliers in high-dimensional feature spaces, but acts as a black box. The Rule Engine maps domain failure semantics directly to human-understandable root causes and actionable recommendations.

- **Q: How is the Alert Score calculated?**  
  *A:* A weighted blend combining:
  `Alert Score = 0.35 * ML_Score + 0.35 * Stat_Score (Z-score + EWMA) + 0.30 * Rule_Engine_Penalty` (clamped between 0 and 100).

- **Q: What dataset is used?**  
  *A:* The LogHub HDFS benchmark dataset from LogPAI, comprising over 11 million log lines parsed into 575,061 block traces.
