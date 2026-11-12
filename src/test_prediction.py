
from pathlib import Path

import joblib
import pandas as pd

PROJECT_DIR = Path(__file__).resolve().parent.parent
MODEL_FILE = PROJECT_DIR / "models" / "irrigation_model.joblib"

FEATURE_COLUMNS = [
    "CropType",
    "CropDays",
    "Soil Moisture",
    "Soil Temperature",
    "Temperature",
    "Humidity",
]


def main():
    model = joblib.load(MODEL_FILE)

    # Example inputs matching the dataset's feature order.
    sample = pd.DataFrame(
        [[1, 10, 140, 24, 28, 62]],
        columns=FEATURE_COLUMNS,
    )

    prediction = int(model.predict(sample)[0])
    probabilities = model.predict_proba(sample)[0]

    print("Prediction test completed!")
    print("Input values:")
    print(sample.to_string(index=False))

    if prediction == 1:
        print("\nModel prediction: Irrigation needed")
    else:
        print("\nModel prediction: No irrigation needed")

    print(f"Probability of no irrigation: {probabilities[0]:.3f}")
    print(f"Probability of irrigation needed: {probabilities[1]:.3f}")


if __name__ == "__main__":
    main()
