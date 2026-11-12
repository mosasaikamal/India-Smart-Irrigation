
from pathlib import Path
import pandas as pd

# Locate project files
PROJECT_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = PROJECT_DIR / "data" / "irrigation_dataset.xlsx"
OUTPUT_FILE = PROJECT_DIR / "data" / "irrigation_clean.csv"

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
    print("Loading original dataset...")
    df = pd.read_excel(INPUT_FILE)

    # Keep only the relevant features and target
    required_columns = FEATURE_COLUMNS + [TARGET_COLUMN]

    missing_columns = [
        column for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Required columns are missing: {missing_columns}"
        )

    df = df[required_columns].copy()

    # Ensure all selected columns contain numeric data
    for column in required_columns:
        df[column] = pd.to_numeric(
            df[column], errors="coerce"
        )

    original_rows = len(df)

    # Remove incomplete and duplicate records
    df = df.dropna(subset=required_columns)
    df = df.drop_duplicates()

    # Validate the irrigation labels
    if not df[TARGET_COLUMN].isin([0, 1]).all():
        raise ValueError(
            "Unexpected irrigation labels. Expected 0 or 1."
        )

    # Save the cleaned dataset
    df.to_csv(OUTPUT_FILE, index=False)

    print("\nData preparation completed!")
    print(f"Original rows: {original_rows}")
    print(f"Cleaned rows: {len(df)}")
    print(f"Columns: {len(df.columns)}")
    print(f"Saved to: {OUTPUT_FILE}")
    print("\nIrrigation label counts:")
    print(df[TARGET_COLUMN].value_counts().sort_index())


if __name__ == "__main__":
    main()
