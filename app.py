import os
import json
import time
import random
import threading
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from anomaly_engine import AnomalyEngine

app = Flask(__name__, static_folder='frontend/dist')
CORS(app)

# Initialize anomaly detection engine
engine = AnomalyEngine()

# Global state for monitoring dashboard
state_lock = threading.Lock()
stream_active = True
stream_speed_sec = 2.0  # Ingest 1 block every 2 seconds
alert_threshold = 60.0  # Alert threshold (default 60)

total_logs_processed = 0
normal_events_count = 0
anomalies_detected_count = 0
high_alerts_count = 0
critical_alerts_count = 0

alerts_history = []
recent_logs_stream = []
anomaly_trends = [] # { time: "10:20:00", score: 85, anomalies: 3, normal: 20 }

# Load stream sample records for simulation
with open('backend_data/stream_sample.json', 'r') as f:
    sample_records = json.load(f)

sample_index = 0

def process_single_block(block_id=None, counts=None, ground_truth=None):
    global total_logs_processed, normal_events_count, anomalies_detected_count
    global high_alerts_count, critical_alerts_count, sample_index
    
    with state_lock:
        if block_id is None or counts is None:
            rec = sample_records[sample_index % len(sample_records)]
            sample_index += 1
            block_id = rec['block_id']
            counts = rec['event_counts']
            ground_truth = rec.get('ground_truth', 'Unknown')
            
        result = engine.evaluate_block(block_id, counts)
        result['timestamp'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        result['ground_truth'] = ground_truth
        
        total_logs_processed += 1
        
        score = result['alert_score']
        severity = result['severity']
        
        if score >= alert_threshold:
            anomalies_detected_count += 1
            if severity == 'High':
                high_alerts_count += 1
            elif severity == 'Critical':
                critical_alerts_count += 1
                
            # Assign Alert ID
            result['alert_id'] = f"ALT-{len(alerts_history)+1:04d}"
            alerts_history.insert(0, result)
            if len(alerts_history) > 200:
                alerts_history.pop()
        else:
            normal_events_count += 1
            
        # Add to recent log stream buffer
        recent_logs_stream.insert(0, result)
        if len(recent_logs_stream) > 50:
            recent_logs_stream.pop()
            
        # Update trend metric
        curr_time = datetime.now().strftime("%H:%M:%S")
        anomaly_trends.append({
            "time": curr_time,
            "score": score,
            "severity": severity,
            "total": total_logs_processed,
            "anomalies": anomalies_detected_count,
            "normal": normal_events_count
        })
        if len(anomaly_trends) > 30:
            anomaly_trends.pop(0)
            
        return result

# Background Streaming Thread
def background_stream_worker():
    while True:
        time.sleep(stream_speed_sec)
        if stream_active:
            try:
                process_single_block()
            except Exception as e:
                print("Stream worker error:", e)

# Initial seed of 15 blocks
for _ in range(15):
    process_single_block()

stream_thread = threading.Thread(target=background_stream_worker, daemon=True)
stream_thread.start()

# API Routes
@app.route('/api/status', methods=['GET'])
def get_status():
    with state_lock:
        latest = recent_logs_stream[0] if len(recent_logs_stream) > 0 else None
        return jsonify({
            "system_status": "MONITORING" if stream_active else "PAUSED",
            "stream_active": stream_active,
            "stream_speed_sec": stream_speed_sec,
            "alert_threshold": alert_threshold,
            "summary": {
                "total_logs": total_logs_processed,
                "normal_events": normal_events_count,
                "anomalies_detected": anomalies_detected_count,
                "high_alerts": high_alerts_count,
                "critical_alerts": critical_alerts_count
            },
            "current_active_alert": latest,
            "recent_logs": recent_logs_stream[:10],
            "trends": anomaly_trends
        })

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    severity_filter = request.args.get('severity', 'all').lower()
    search = request.args.get('search', '').lower()
    
    with state_lock:
        filtered = []
        for alt in alerts_history:
            if severity_filter != 'all' and alt['severity'].lower() != severity_filter:
                continue
            if search and (search not in alt['alert_id'].lower() and 
                           search not in alt['block_id'].lower() and 
                           search not in alt['anomaly_type'].lower() and
                           search not in alt['affected_module'].lower()):
                continue
            filtered.append(alt)
            
        return jsonify({
            "total_alerts": len(filtered),
            "alerts": filtered
        })

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    return jsonify(engine.metrics)

@app.route('/api/templates', methods=['GET'])
def get_templates():
    tpl_list = [{"event_id": k, "template": v} for k, v in engine.templates.items()]
    return jsonify(tpl_list)

@app.route('/api/stream/start', methods=['POST'])
def start_stream():
    global stream_active
    with state_lock:
        stream_active = True
    return jsonify({"status": "Stream started", "stream_active": True})

@app.route('/api/stream/stop', methods=['POST'])
def stop_stream():
    global stream_active
    with state_lock:
        stream_active = False
    return jsonify({"status": "Stream paused", "stream_active": False})

@app.route('/api/stream/reset', methods=['POST'])
def reset_stream():
    global total_logs_processed, normal_events_count, anomalies_detected_count
    global high_alerts_count, critical_alerts_count, sample_index
    with state_lock:
        total_logs_processed = 0
        normal_events_count = 0
        anomalies_detected_count = 0
        high_alerts_count = 0
        critical_alerts_count = 0
        alerts_history.clear()
        recent_logs_stream.clear()
        anomaly_trends.clear()
        sample_index = 0
    # Process initial seed
    for _ in range(5):
        process_single_block()
    return jsonify({"status": "State reset successfully"})

@app.route('/api/stream/ingest', methods=['POST'])
def ingest_block():
    data = request.json or {}
    block_type = data.get('type', 'random') # 'normal', 'anomaly', 'random'
    
    with state_lock:
        if block_type == 'anomaly':
            # find an anomaly block in sample_records
            anom_recs = [r for r in sample_records if r.get('ground_truth') == 'Fail']
            rec = random.choice(anom_recs) if anom_recs else sample_records[0]
        elif block_type == 'normal':
            norm_recs = [r for r in sample_records if r.get('ground_truth') == 'Success']
            rec = random.choice(norm_recs) if norm_recs else sample_records[0]
        else:
            rec = sample_records[sample_index % len(sample_records)]
            
    res = process_single_block(rec['block_id'], rec['event_counts'], rec.get('ground_truth'))
    return jsonify(res)

@app.route('/api/threshold', methods=['POST'])
def set_threshold():
    global alert_threshold
    data = request.json or {}
    val = float(data.get('threshold', 60.0))
    with state_lock:
        alert_threshold = max(0.0, min(100.0, val))
    return jsonify({"status": "Threshold updated", "alert_threshold": alert_threshold})

@app.route('/api/evaluate', methods=['POST'])
def evaluate_custom():
    data = request.json or {}
    block_id = data.get('block_id', 'blk_custom_eval')
    event_counts = data.get('event_counts', [0]*29)
    res = engine.evaluate_block(block_id, event_counts)
    return jsonify(res)

# Serve Frontend Static Assets
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    dist_dir = os.path.join(os.path.dirname(__file__), 'frontend', 'dist')
    if path != "" and os.path.exists(os.path.join(dist_dir, path)):
        return send_from_directory(dist_dir, path)
    elif os.path.exists(os.path.join(dist_dir, 'index.html')):
        return send_from_directory(dist_dir, 'index.html')
    else:
        return jsonify({
            "message": "Lightweight Explainable Anomaly Detection Framework API Server Running.",
            "frontend_note": "Build the frontend using `npm run build` in /frontend to serve UI directly here."
        })

if __name__ == '__main__':
    print("Starting Explainable Anomaly Detection Framework Flask Backend on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
