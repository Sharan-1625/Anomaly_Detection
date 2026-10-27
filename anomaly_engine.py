import os
import json
import numpy as np
import joblib

class AnomalyEngine:
    def __init__(self, data_dir='backend_data'):
        self.data_dir = data_dir
        self.iso_forest = None
        self.metrics = None
        self.feature_means = None
        self.feature_stds = None
        
        # Log templates definitions
        self.templates = {
            "E1": "Adding an already existing block",
            "E2": "Verification succeeded for block",
            "E3": "Served block to client",
            "E4": "Got exception while serving block",
            "E5": "Receiving block",
            "E6": "Received block src dest",
            "E7": "writeBlock received exception",
            "E8": "PacketResponder for block Interrupted",
            "E9": "Received block of size from DataNode",
            "E10": "PacketResponder Exception",
            "E11": "PacketResponder for block terminating",
            "E12": "Exception writing block to mirror DataNode",
            "E13": "Receiving empty packet for block",
            "E14": "Exception in receiveBlock for block",
            "E15": "Changing block file offset",
            "E16": "Transmitted block to DataNode",
            "E17": "Failed to transfer block to target host",
            "E18": "Starting thread to transfer block",
            "E19": "Reopen Block",
            "E20": "Unexpected error trying to delete block / BlockInfo not found in volumeMap",
            "E21": "Deleting block file",
            "E22": "BLOCK* NameSystem allocateBlock",
            "E23": "BLOCK* NameSystem delete block added to invalidSet",
            "E24": "BLOCK* Removing block from neededReplications as it does not belong to any file",
            "E25": "BLOCK* ask DataNode to replicate block",
            "E26": "BLOCK* NameSystem addStoredBlock: blockMap updated",
            "E27": "BLOCK* NameSystem addStoredBlock: Redundant addStoredBlock request received",
            "E28": "BLOCK* NameSystem addStoredBlock request received... But it does not belong to any file",
            "E29": "PendingReplicationMonitor timed out block"
        }
        
        # EWMA state tracking
        self.ewma_alpha = 0.2
        self.ewma_state = None
        
        self.load_models()
        
    def load_models(self):
        metrics_path = os.path.join(self.data_dir, 'metrics.json')
        model_path = os.path.join(self.data_dir, 'isolation_forest.joblib')
        
        if os.path.exists(metrics_path) and os.path.exists(model_path):
            with open(metrics_path, 'r') as f:
                self.metrics = json.load(f)
            self.iso_forest = joblib.load(model_path)
            self.feature_means = np.array(self.metrics['feature_means'])
            self.feature_stds = np.array(self.metrics['feature_stds'])
            self.ewma_state = self.feature_means.copy()
        else:
            raise FileNotFoundError("Trained models not found. Please run train_and_eval.py first.")

    def evaluate_block(self, block_id, event_counts):
        """
        Evaluates a block vector (29 events E1-E29) using Z-score, EWMA, Isolation Forest, 
        and Domain Rule Evaluation. Returns complete structured alert analysis.
        """
        counts = np.array(event_counts, dtype=float)
        
        # 1. Z-Score Deviation Calculation
        z_scores = np.abs(counts - self.feature_means) / self.feature_stds
        max_z_idx = int(np.argmax(z_scores))
        max_z_val = float(z_scores[max_z_idx])
        overall_z = float(np.sqrt(np.sum(z_scores**2)))
        
        # Z-score contribution normalized to 0-100
        z_stat_score = float(min(100.0, (overall_z / 10.0) * 100.0))
        
        # 2. EWMA (Exponentially Weighted Moving Average) Tracking
        self.ewma_state = self.ewma_alpha * counts + (1.0 - self.ewma_alpha) * self.ewma_state
        ewma_dev = float(np.linalg.norm(self.ewma_state - self.feature_means))
        ewma_score = float(min(100.0, (ewma_dev / 8.0) * 100.0))
        
        # 3. Isolation Forest ML Model Anomaly Score
        # decision_function gives score where lower is more anomalous (typically in range -0.3 to 0.3)
        raw_if_score = float(self.iso_forest.decision_function([counts])[0])
        # Convert to 0-100 scale (0 = normal, 100 = highly anomalous)
        if_score = float(min(100.0, max(0.0, (0.25 - raw_if_score) / 0.5 * 100.0)))
        
        # 4. Domain Rule Evaluation Engine
        matched_rules = []
        rule_score_boost = 0.0
        affected_module = "General HDFS Block Engine"
        
        # Rule check matrix
        # E4: Serve exception
        if counts[3] > 0:
            matched_rules.append({
                "rule_id": "RULE_EXCEPT_SERVE",
                "name": "DataNode Serve Transport Exception",
                "template": "E4: Got exception while serving block",
                "weight": 35,
                "module": "DataNode Serve Subsystem",
                "action": "Check DataNode network sockets, active client connections, and disk I/O latency."
            })
            rule_score_boost += 35.0
            affected_module = "DataNode Serve Subsystem"
            
        # E7: writeBlock received exception
        if counts[6] > 0:
            matched_rules.append({
                "rule_id": "RULE_WRITE_BLOCK_EXCEPTION",
                "name": "DataNode Write Block Stream Failure",
                "template": "E7: writeBlock received exception",
                "weight": 40,
                "module": "Block Receiver Engine",
                "action": "Inspect target DataNode storage volume write permissions and available disk space."
            })
            rule_score_boost += 40.0
            affected_module = "Block Receiver Engine"
            
        # E8: PacketResponder Interrupted
        if counts[7] > 0:
            matched_rules.append({
                "rule_id": "RULE_PACKET_INTERRUPT",
                "name": "Network PacketResponder Interrupted",
                "template": "E8: PacketResponder for block Interrupted",
                "weight": 40,
                "module": "Network Transport Pipeline",
                "action": "Investigate DataNode network timeouts, packet losses, and TCP buffer exhaustion."
            })
            rule_score_boost += 40.0
            affected_module = "Network Transport Pipeline"
            
        # E10: PacketResponder Exception
        if counts[9] > 0:
            matched_rules.append({
                "rule_id": "RULE_PACKET_EXCEPT",
                "name": "PacketResponder Thread Crash",
                "template": "E10: PacketResponder Exception",
                "weight": 45,
                "module": "Packet Responder Pipeline",
                "action": "Check JVM memory/GC pauses on DataNode and restart hung DataNode daemons if unrecoverable."
            })
            rule_score_boost += 45.0
            affected_module = "Packet Responder Pipeline"
            
        # E12: Exception writing block to mirror
        if counts[11] > 0:
            matched_rules.append({
                "rule_id": "RULE_WRITE_MIRROR_FAIL",
                "name": "Replication Mirror Write Exception",
                "template": "E12: Exception writing block to mirror DataNode",
                "weight": 45,
                "module": "Replication Mirror Pipeline",
                "action": "Verify inter-DataNode rack connectivity, firewall rules, and mirror target DataNode health."
            })
            rule_score_boost += 45.0
            affected_module = "Replication Mirror Pipeline"
            
        # E14: Exception in receiveBlock
        if counts[13] > 0:
            matched_rules.append({
                "rule_id": "RULE_RECEIVE_BLOCK_EXCEPT",
                "name": "Block Ingestion Fatal Exception",
                "template": "E14: Exception in receiveBlock for block",
                "weight": 40,
                "module": "DataNode Storage Manager",
                "action": "Check DataNode block directory corruption and filesystem integrity (fsck)."
            })
            rule_score_boost += 40.0
            affected_module = "DataNode Storage Manager"
            
        # E17: Failed to transfer block
        if counts[16] > 0:
            matched_rules.append({
                "rule_id": "RULE_TRANSFER_FAILED",
                "name": "Inter-Node Block Transfer Failure",
                "template": "E17: Failed to transfer block to target host",
                "weight": 35,
                "module": "DataNode Replicator",
                "action": "Review NameNode topology map, network routing tables, and target host readiness."
            })
            rule_score_boost += 35.0
            affected_module = "DataNode Replicator"
            
        # E20: Unexpected error deleting block / missing volumeMap
        if counts[19] > 0:
            matched_rules.append({
                "rule_id": "RULE_UNEXPECTED_DELETE_ERROR",
                "name": "VolumeMap Block Inconsistency Error",
                "template": "E20: Unexpected error trying to delete block / BlockInfo missing",
                "weight": 30,
                "module": "Block Management System",
                "action": "Trigger NameNode block report audit and sync local volumeMap metadata."
            })
            rule_score_boost += 30.0
            if affected_module == "General HDFS Block Engine":
                affected_module = "Block Management System"
                
        # E27 / E28: Redundant or orphan addStoredBlock
        if counts[26] > 0 or counts[27] > 0:
            matched_rules.append({
                "rule_id": "RULE_INVALID_STORED_BLOCK_MAP",
                "name": "NameNode BlockMap Inconsistency / Orphan Add",
                "template": "E27/E28: addStoredBlock request received but not belonging to file",
                "weight": 25,
                "module": "NameNode Block Metadata",
                "action": "Re-index NameNode metadata catalog and clean up orphaned block IDs."
            })
            rule_score_boost += 25.0
            if affected_module == "General HDFS Block Engine":
                affected_module = "NameNode Block Metadata"

        # E29: PendingReplicationMonitor timed out block
        if counts[28] > 0:
            matched_rules.append({
                "rule_id": "RULE_REPLICATION_TIMEOUT",
                "name": "NameSystem Replication Monitor Timeout",
                "template": "E29: PendingReplicationMonitor timed out block",
                "weight": 50,
                "module": "NameSystem Replication Monitor",
                "action": "High Priority: Investigate DataNode pool under-replication, node failures, or heavy load."
            })
            rule_score_boost += 50.0
            affected_module = "NameSystem Replication Monitor"

        # Spike Rule: total volume spike
        total_events = float(np.sum(counts))
        mean_total_events = float(np.sum(self.feature_means))
        if total_events > 3.0 * max(mean_total_events, 1.0):
            matched_rules.append({
                "rule_id": "RULE_EVENT_VOLUME_SPIKE",
                "name": "Abnormal Log Event Count Volume Spike",
                "template": f"Total event volume ({total_events:.0f}) exceeded 3x normal average ({mean_total_events:.1f})",
                "weight": 25,
                "module": "System Resource / I/O Stream",
                "action": "Monitor system CPU/IOPS metrics and verify client retry loops."
            })
            rule_score_boost += 25.0

        # 5. Calculate Unified Alert Score (0 to 100)
        stat_combined = (z_stat_score + ewma_score) / 2.0
        rule_score_clamped = min(100.0, rule_score_boost)
        
        # Weighted ensemble formula
        final_score = (0.35 * if_score) + (0.35 * stat_combined) + (0.30 * rule_score_clamped)
        
        # If severe domain rules triggered (like E29, E12, E10), ensure minimum threshold bump
        if len(matched_rules) > 0 and rule_score_boost >= 40:
            final_score = max(final_score, 65.0 + min(35.0, rule_score_boost - 40))
            
        final_score = round(float(min(100.0, max(0.0, final_score))), 1)

        # 6. Severity Classification
        if final_score <= 30.0:
            severity = "Low"
            severity_code = 1
        elif final_score <= 60.0:
            severity = "Medium"
            severity_code = 2
        elif final_score <= 80.0:
            severity = "High"
            severity_code = 3
        else:
            severity = "Critical"
            severity_code = 4

        # 7. Generate Rule-Based Explanation and Recommended Action
        if len(matched_rules) > 0:
            rule_names = ", ".join([r['name'] for r in matched_rules])
            explanation = (
                f"Anomaly detected due to critical domain rule matches ({rule_names}). "
                f"Statistical Z-Score deviation peaked at {max_z_val:.2f} (E{max_z_idx+1}), "
                f"and Isolation Forest model computed an anomaly probability score of {if_score:.1f}/100."
            )
            actions = list(set([r['action'] for r in matched_rules]))
            recommended_action = " ".join(actions)
            anomaly_type = matched_rules[0]['name']
        elif final_score > 30.0:
            explanation = (
                f"Observation deviated significantly from historical baseline behavior. "
                f"Z-Score deviation total is {overall_z:.2f} and Isolation Forest score is {if_score:.1f}/100. "
                f"No specific fatal error template triggered, but statistical pattern indicates unusual system behavior."
            )
            recommended_action = "Review recent system logs for block " + str(block_id) + " and monitor host node resource utilization."
            anomaly_type = "Statistical Behavioral Drift"
        else:
            explanation = "Block execution trace matches standard operational baseline within normal tolerances."
            recommended_action = "No immediate action required. Continue normal system monitoring."
            anomaly_type = "Normal Operation"

        # Present event occurrence summary (non-zero events)
        active_events = []
        for i, cnt in enumerate(counts):
            if cnt > 0:
                e_key = f"E{i+1}"
                active_events.append({
                    "event_id": e_key,
                    "template": self.templates.get(e_key, ""),
                    "count": int(cnt)
                })

        return {
            "block_id": block_id,
            "alert_score": final_score,
            "severity": severity,
            "severity_code": severity_code,
            "anomaly_type": anomaly_type,
            "affected_module": affected_module,
            "explanation": explanation,
            "recommended_action": recommended_action,
            "detection_methods": {
                "z_score": round(z_stat_score, 1),
                "z_max_val": round(max_z_val, 2),
                "ewma_score": round(ewma_score, 1),
                "isolation_forest_score": round(if_score, 1),
                "rule_engine_score": round(rule_score_clamped, 1)
            },
            "matched_rules": matched_rules,
            "active_events": active_events,
            "total_event_count": int(np.sum(counts))
        }
