
from pathlib import Path
import pandas as pd
from sklearn.model_selection import train_test_split

PROJECT_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = PROJECT_DIR / "data" / "irrigation_clean.csv"

FEATURE_COLUMNS = [
    "CropType",
    "CropDays",
    "Soil Moisture",
    "Soil Temperature",
    "Temperature",
    "Humidity",
]

TARGET_COLUMN = "Irrigation(Y/N)"


def main():
    df = pd.read_csv(DATA_FILE)

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    print("Data split completed successfully!")
    print(f"Training records: {len(X_train)}")
    print(f"Testing records: {len(X_test)}")

    print("\nTraining label distribution:")
    print(y_train.value_counts().sort_index())

    print("\nTesting label distribution:")
    print(y_test.value_counts().sort_index())

    print("\nFeature columns:")
    print(X_train.columns.tolist())


if __name__ == "__main__":
    main()
