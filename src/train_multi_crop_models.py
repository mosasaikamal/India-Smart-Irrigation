"""
Multi-Crop Model Training Pipeline.
Trains scientifically verified, crop-specific machine learning models for all agricultural
crops with genuine field sensor datasets.

Datasets:
1. Paddy & Groundnut: GCEK Kalahandi IoT-IIRS Dataset (PeerJ Computer Science, 2021)
2. Wheat, Maize, Sugarcane: NIT Raipur Agricultural Automation Dataset (Dept of Computer Applications)
3. Tomato: Mendeley Data (DOI: 10.17632/c837v6p8ph.2, Univ of Salento / Univ of Bari)
4. Chilli: Smart Agriculture Dataset (Kaggle / Chaitanya Gopidesi)

Integrity Note:
Only crops with verified real-world datasets are trained.
No synthetic data, no copied records, and no invented labels.
"""

from datetime import datetime
from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

PROJECT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_DIR / "data"
MODEL_DIR = PROJECT_DIR / "models"


def train_paddy():
    print("\n--- Training Paddy (Rice) Model ---")
    df = pd.read_csv(DATA_DIR / "irrigation_clean.csv")
    sub = df[df["CropType"] == 1].copy()
    features = ["CropDays", "Soil Moisture", "Soil Temperature", "Temperature", "Humidity"]
    X = sub[features]
    y = sub["Irrigation(Y/N)"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    pipeline = make_pipeline(
        StandardScaler(),
        LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42),
    )
    pipeline.fit(X_train, y_train)
    pred = pipeline.predict(X_test)

    acc = float(accuracy_score(y_test, pred))
    prec = float(precision_score(y_test, pred, zero_division=0))
    rec = float(recall_score(y_test, pred, zero_division=0))
    f1 = float(f1_score(y_test, pred, zero_division=0))
    cm = confusion_matrix(y_test, pred).tolist()

    out_file = MODEL_DIR / "paddy_model.joblib"
    joblib.dump(pipeline, out_file)
    print(f"Paddy Model saved. Acc: {acc:.3f}, F1: {f1:.3f}, Samples: {len(sub)}")

    return {
        "crop_key": "1",
        "crop_code": "paddy",
        "crop_name": "Paddy (Rice)",
        "model_file": str(out_file.relative_to(PROJECT_DIR)).replace("\\", "/"),
        "dataset_source": "GCEK Kalahandi / PeerJ CS IoT-IIRS Dataset",
        "source_url": "https://github.com/GCEKIoTCommunity/Irrigation-Dataset",
        "records_count": len(sub),
        "features": features,
        "algorithm": "Logistic Regression with StandardScaler",
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm,
        "training_date": datetime.now().strftime("%Y-%m-%d"),
    }


def train_groundnuts():
    print("\n--- Training Ground Nuts Model ---")
    df = pd.read_csv(DATA_DIR / "irrigation_clean.csv")
    sub = df[df["CropType"] == 2].copy()
    features = ["CropDays", "Soil Moisture", "Soil Temperature", "Temperature", "Humidity"]
    X = sub[features]
    y = sub["Irrigation(Y/N)"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    pipeline = make_pipeline(
        StandardScaler(),
        LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42),
    )
    pipeline.fit(X_train, y_train)
    pred = pipeline.predict(X_test)

    acc = float(accuracy_score(y_test, pred))
    prec = float(precision_score(y_test, pred, zero_division=0))
    rec = float(recall_score(y_test, pred, zero_division=0))
    f1 = float(f1_score(y_test, pred, zero_division=0))
    cm = confusion_matrix(y_test, pred).tolist()

    out_file = MODEL_DIR / "groundnuts_model.joblib"
    joblib.dump(pipeline, out_file)
    print(f"Ground Nuts Model saved. Acc: {acc:.3f}, F1: {f1:.3f}, Samples: {len(sub)}")

    return {
        "crop_key": "2",
        "crop_code": "groundnuts",
        "crop_name": "Ground Nuts (Peanut)",
        "model_file": str(out_file.relative_to(PROJECT_DIR)).replace("\\", "/"),
        "dataset_source": "GCEK Kalahandi / PeerJ CS IoT-IIRS Dataset",
        "source_url": "https://github.com/GCEKIoTCommunity/Irrigation-Dataset",
        "records_count": len(sub),
        "features": features,
        "algorithm": "Logistic Regression with StandardScaler",
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm,
        "training_date": datetime.now().strftime("%Y-%m-%d"),
    }


def train_nit_raipur_crop(crop_id: int, crop_code: str, crop_name: str, model_type="rf"):
    print(f"\n--- Training {crop_name} Model (NIT Raipur) ---")
    cols = ["CropType", "CropDays", "SoilMoisture", "Temperature", "Humidity", "Irrigation"]
    df = pd.read_csv(DATA_DIR / "nit_raipur_datasets.csv", header=None, names=cols)

    sub = df[df["CropType"] == crop_id].copy()
    # Clean outlier if any
    sub = sub[sub["Temperature"] < 60]

    features = ["CropDays", "SoilMoisture", "Temperature", "Humidity"]
    X = sub[features]
    y = sub["Irrigation"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    if model_type == "rf":
        pipeline = RandomForestClassifier(
            n_estimators=100, max_depth=4, class_weight="balanced", random_state=42
        )
        algo_name = "Random Forest Classifier (Balanced)"
    else:
        pipeline = make_pipeline(
            StandardScaler(),
            LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42),
        )
        algo_name = "Logistic Regression with StandardScaler"

    pipeline.fit(X_train, y_train)
    pred = pipeline.predict(X_test)

    acc = float(accuracy_score(y_test, pred))
    prec = float(precision_score(y_test, pred, zero_division=0))
    rec = float(recall_score(y_test, pred, zero_division=0))
    f1 = float(f1_score(y_test, pred, zero_division=0))
    cm = confusion_matrix(y_test, pred).tolist()

    out_file = MODEL_DIR / f"{crop_code}_model.joblib"
    joblib.dump(pipeline, out_file)
    print(f"{crop_name} Model saved. Acc: {acc:.3f}, F1: {f1:.3f}, Samples: {len(sub)}")

    return {
        "crop_key": crop_code,
        "crop_code": crop_code,
        "crop_name": crop_name,
        "model_file": str(out_file.relative_to(PROJECT_DIR)).replace("\\", "/"),
        "dataset_source": "NIT Raipur Dept of Computer Applications Agricultural Automation",
        "source_url": "https://github.com/NitrrMCACommunity/Agriculture-Automation-",
        "records_count": len(sub),
        "features": features,
        "algorithm": algo_name,
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm,
        "training_date": datetime.now().strftime("%Y-%m-%d"),
    }


def train_tomato():
    print("\n--- Training Tomato (Tamatar) Model ---")
    df = pd.read_csv(DATA_DIR / "tomato_mendeley_clf.csv")
    features = ["soil_moisture", "soil_temp", "air_temp", "humidity"]
    X = df[features]
    y = df["irrigate_next_hour"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    pipeline = RandomForestClassifier(
        n_estimators=150, max_depth=6, class_weight="balanced", random_state=42
    )
    pipeline.fit(X_train, y_train)
    pred = pipeline.predict(X_test)

    acc = float(accuracy_score(y_test, pred))
    prec = float(precision_score(y_test, pred, zero_division=0))
    rec = float(recall_score(y_test, pred, zero_division=0))
    f1 = float(f1_score(y_test, pred, zero_division=0))
    cm = confusion_matrix(y_test, pred).tolist()

    out_file = MODEL_DIR / "tomato_model.joblib"
    joblib.dump(pipeline, out_file)
    print(f"Tomato Model saved. Acc: {acc:.3f}, Rec: {rec:.3f}, Samples: {len(df)}")

    return {
        "crop_key": "tomato",
        "crop_code": "tomato",
        "crop_name": "Tomato (Tamatar)",
        "model_file": str(out_file.relative_to(PROJECT_DIR)).replace("\\", "/"),
        "dataset_source": "Mendeley Data DOI 10.17632/c837v6p8ph.2 (Univ of Salento/Bari)",
        "source_url": "https://data.mendeley.com/datasets/c837v6p8ph/2",
        "records_count": len(df),
        "features": features,
        "algorithm": "Random Forest Classifier (Balanced)",
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm,
        "training_date": datetime.now().strftime("%Y-%m-%d"),
    }


def train_chilli():
    print("\n--- Training Chilli (Mirchi) Model ---")
    df = pd.read_csv(DATA_DIR / "kaggle_cropdata_updated.csv")
    sub = df[df["crop ID"] == "Chilli"].copy()
    sub["target"] = (sub["result"] == 1).astype(int)
    features = ["MOI", "temp", "humidity"]
    X = sub[features]
    y = sub["target"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    pipeline = RandomForestClassifier(
        n_estimators=100, max_depth=5, random_state=42
    )
    pipeline.fit(X_train, y_train)
    pred = pipeline.predict(X_test)

    acc = float(accuracy_score(y_test, pred))
    prec = float(precision_score(y_test, pred, zero_division=0))
    rec = float(recall_score(y_test, pred, zero_division=0))
    f1 = float(f1_score(y_test, pred, zero_division=0))
    cm = confusion_matrix(y_test, pred).tolist()

    out_file = MODEL_DIR / "chilli_model.joblib"
    joblib.dump(pipeline, out_file)
    print(f"Chilli Model saved. Acc: {acc:.3f}, F1: {f1:.3f}, Samples: {len(sub)}")

    return {
        "crop_key": "chilli",
        "crop_code": "chilli",
        "crop_name": "Chilli (Mirchi)",
        "model_file": str(out_file.relative_to(PROJECT_DIR)).replace("\\", "/"),
        "dataset_source": "Smart Agriculture Dataset (Kaggle / Chaitanya Gopidesi)",
        "source_url": "https://www.kaggle.com/datasets/chaitanyagopidesi/smart-agriculture-dataset",
        "records_count": len(sub),
        "features": features,
        "algorithm": "Random Forest Classifier",
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm,
        "training_date": datetime.now().strftime("%Y-%m-%d"),
    }


def main():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    metrics_report = {}

    metrics_report["1"] = train_paddy()
    metrics_report["2"] = train_groundnuts()
    metrics_report["wheat"] = train_nit_raipur_crop(1, "wheat", "Wheat (Gehun)", model_type="rf")
    metrics_report["maize"] = train_nit_raipur_crop(4, "maize", "Maize / Corn (Makka)", model_type="rf")
    metrics_report["sugarcane"] = train_nit_raipur_crop(8, "sugarcane", "Sugarcane (Ganna)", model_type="lr")
    metrics_report["tomato"] = train_tomato()
    metrics_report["chilli"] = train_chilli()

    # Also keep models/irrigation_model.joblib synchronized
    unified_paddy = MODEL_DIR / "irrigation_model.joblib"
    if not unified_paddy.exists():
        joblib.dump(joblib.load(MODEL_DIR / "paddy_model.joblib"), unified_paddy)

    metrics_file = MODEL_DIR / "model_metrics.json"
    with open(metrics_file, "w", encoding="utf-8") as f:
        json.dump(metrics_report, f, indent=2)

    print(f"\n==========================================")
    print(f"All 7 ML models trained and saved successfully!")
    print(f"Metrics saved to: {metrics_file}")
    print(f"==========================================")


if __name__ == "__main__":
    main()
