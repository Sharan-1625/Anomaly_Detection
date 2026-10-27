import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.metrics import confusion_matrix, precision_recall_fscore_support, accuracy_score, roc_auc_score
import joblib

def run_training_and_evaluation():
    os.makedirs('backend_data', exist_ok=True)
    
    print("Step 1: Loading preprocessed HDFS dataset...")
    df = pd.read_csv('preprocessed/Event_occurrence_matrix.csv')
    
    # Extract feature columns E1 to E29
    feature_cols = ['E' + str(i) for i in range(1, 30)]
    X = df[feature_cols].values
    y = (df['Label'] == 'Fail').astype(int).values
    block_ids = df['BlockId'].values
    
    total_samples = len(df)
    anomaly_count = int(y.sum())
    normal_count = total_samples - anomaly_count
    
    print(f"Total Blocks: {total_samples} (Normal: {normal_count}, Anomaly: {anomaly_count})")
    
    # Step 2: 70% Train, 15% Validation, 15% Testing Split
    print("Step 2: Splitting dataset into 70% Train, 15% Validation, 15% Test...")
    X_train, X_temp, y_train, y_temp, blocks_train, blocks_temp = train_test_split(
        X, y, block_ids, test_size=0.30, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test, blocks_val, blocks_test = train_test_split(
        X_temp, y_temp, blocks_temp, test_size=0.50, random_state=42, stratify=y_temp
    )
    
    train_size = len(X_train)
    val_size = len(X_val)
    test_size = len(X_test)
    
    # Step 3: Statistical Profiling (Z-Score baseline on Normal Train data)
    normal_train_mask = (y_train == 0)
    X_train_normal = X_train[normal_train_mask]
    
    mean_vector = np.mean(X_train_normal, axis=0)
    std_vector = np.std(X_train_normal, axis=0)
    # Avoid zero division
    std_vector = np.where(std_vector == 0, 1e-5, std_vector)
    
    # Step 4: Machine Learning Model Training (Isolation Forest)
    print("Step 4: Training Isolation Forest Model...")
    iso = IsolationForest(
        n_estimators=100,
        contamination=0.03,
        random_state=42,
        n_jobs=-1
    )
    iso.fit(X_train)
    
    # Step 5: Model Evaluation on Validation & Test Sets
    print("Step 5: Evaluating Model on Test Set (15%)...")
    test_decision_scores = -iso.decision_function(X_test)
    val_decision_scores = -iso.decision_function(X_val)
    
    # Tune threshold on validation set
    threshold = float(np.percentile(val_decision_scores, 97))
    test_preds = (test_decision_scores > threshold).astype(int)
    
    acc = float(accuracy_score(y_test, test_preds))
    prec, rec, f1, _ = precision_recall_fscore_support(y_test, test_preds, average='binary')
    roc_auc = float(roc_auc_score(y_test, test_decision_scores))
    cm = confusion_matrix(y_test, test_preds)
    
    tn, fp, fn, tp = [int(val) for val in cm.ravel()]
    
    # Evaluate Statistical Z-score detector on Test set
    def z_score_predict(X_data):
        z_scores = np.max(np.abs(X_data - mean_vector) / std_vector, axis=1)
        return z_scores
    
    test_z_scores = z_score_predict(X_test)
    z_threshold = 3.0
    z_preds = (test_z_scores > z_threshold).astype(int)
    z_acc = float(accuracy_score(y_test, z_preds))
    z_p, z_r, z_f1, _ = precision_recall_fscore_support(y_test, z_preds, average='binary')
    
    metrics = {
        "dataset_summary": {
            "total_blocks": total_samples,
            "normal_blocks": normal_count,
            "anomaly_blocks": anomaly_count,
            "split": {
                "train_pct": 70,
                "train_count": train_size,
                "val_pct": 15,
                "val_count": val_size,
                "test_pct": 15,
                "test_count": test_size
            }
        },
        "isolation_forest": {
            "accuracy": round(acc, 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(roc_auc, 4),
            "confusion_matrix": {
                "tn": tn,
                "fp": fp,
                "fn": fn,
                "tp": tp
            }
        },
        "z_score_detector": {
            "accuracy": round(z_acc, 4),
            "precision": round(float(z_p), 4),
            "recall": round(float(z_r), 4),
            "f1_score": round(float(z_f1), 4)
        },
        "feature_means": mean_vector.tolist(),
        "feature_stds": std_vector.tolist()
    }
    
    # Save model and metadata
    joblib.dump(iso, 'backend_data/isolation_forest.joblib')
    with open('backend_data/metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
        
    print("Step 6: Preparing sample stream dataset (~600 representative blocks)...")
    # Pick 400 normal and 200 fail blocks for stream demo
    fail_indices = df[df['Label'] == 'Fail'].index.tolist()
    success_indices = df[df['Label'] == 'Success'].index.tolist()
    
    np.random.seed(42)
    sample_fail = np.random.choice(fail_indices, size=min(200, len(fail_indices)), replace=False)
    sample_success = np.random.choice(success_indices, size=min(400, len(success_indices)), replace=False)
    
    sample_indices = np.concatenate([sample_fail, sample_success])
    np.random.shuffle(sample_indices)
    
    sample_df = df.iloc[sample_indices].copy()
    stream_records = []
    
    for _, row in sample_df.iterrows():
        b_id = row['BlockId']
        label = row['Label']
        counts = [int(row[f'E{i}']) for i in range(1, 30)]
        stream_records.append({
            "block_id": b_id,
            "ground_truth": label,
            "event_counts": counts
        })
        
    with open('backend_data/stream_sample.json', 'w') as f:
        json.dump(stream_records, f, indent=2)
        
    print("Training and Evaluation completed successfully!")
    print(f"Metrics saved to backend_data/metrics.json. Isolation Forest F1: {f1:.4f}, ROC-AUC: {roc_auc:.4f}")

if __name__ == '__main__':
    run_training_and_evaluation()
