"""Train the irrigation model from India_State_Crop_Irrigation_ML_Training_Dataset.csv
Run:  python train_irrigation_model.py
Creates: irrigation_model.joblib and model_report.json
"""
import json, joblib, numpy as np, pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

DATA = "India_State_Crop_Irrigation_ML_Training_Dataset.csv"
CAT = ["state_or_UT", "crop"]
NUM = ["crop_age_days", "sensor_reading", "gap_to_trigger", "soil_temperature_c",
       "air_temperature_c", "relative_humidity_pct", "rainfall_last_7_days_mm",
       "forecast_rainfall_next_24h_mm"]

def add_features(df):
    df = df.copy()
    df["gap_to_trigger"] = df["sensor_reading"] - df["irrigation_trigger"]
    return df

df = add_features(pd.read_csv(DATA))
X, y = df[CAT + NUM], df["irrigation_required"]
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

model = Pipeline([
    ("prep", ColumnTransformer([("cat", OneHotEncoder(handle_unknown="ignore"), CAT)], remainder="passthrough")),
    ("clf", RandomForestClassifier(n_estimators=200, min_samples_leaf=2, random_state=42, n_jobs=-1)),
])
model.fit(Xtr, ytr)
pred = model.predict(Xte)
acc = accuracy_score(yte, pred)
print("Test accuracy:", round(acc, 4))
print(classification_report(yte, pred, target_names=["Do not irrigate", "Irrigate"]))

# retrain on all data for deployment
model.fit(X, y)
joblib.dump(model, "irrigation_model.joblib")
json.dump({"test_accuracy": acc, "features": CAT + NUM, "rows": len(df)}, open("model_report.json", "w"), indent=2)
