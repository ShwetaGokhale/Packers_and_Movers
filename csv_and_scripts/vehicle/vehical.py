import pymysql
import csv
from datetime import datetime

# Database connection configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'daaple_user',
    'password': 'Daaple@@2025',
    'database': 'daaple_data'
}

# Path to your CSV file
CSV_FILE_PATH = 'updated_vehicle_data.csv'

# SQL insert query
insert_query = """
INSERT INTO accounts_vehicle (
    id, vehicle_number, date_added
) VALUES (
    %s, %s, %s
)
"""

# Helper function to convert multiple date formats
def convert_date(date_str):
    for fmt in ("%m/%d/%Y", "%m-%d-%Y", "%Y-%m-%d"):  # Added support for YYYY-MM-DD
        try:
            return datetime.strptime(date_str.strip(), fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    raise ValueError(f"Invalid date format: {date_str}")

# Read and process CSV
data = []
try:
    with open(CSV_FILE_PATH, mode='r', newline='', encoding='utf-8') as file:
        reader = csv.reader(file)
        next(reader)  # Skip header

        for row in reader:
            if len(row) < 3:
                print(f"⚠️ Skipping incomplete row: {row}")
                continue

            try:
                processed_row = [
                    int(row[0]),               # id
                    row[1].strip(),            # vehicle_no
                    convert_date(row[2])       # date_added
                ]
                data.append(tuple(processed_row))

            except Exception as row_error:
                print(f"❌ Error in row {row}: {row_error}")

except FileNotFoundError:
    print(f"❌ CSV file not found: {CSV_FILE_PATH}")
    exit()

# Insert into DB
try:
    connection = pymysql.connect(**DB_CONFIG)
    cursor = connection.cursor()
    cursor.executemany(insert_query, data)
    connection.commit()
    print(f"✅ Successfully inserted {cursor.rowcount} records into accounts_vehicle.")

except Exception as e:
    print(f"❌ Error during DB insert: {e}")

finally:
    if 'cursor' in locals(): cursor.close()
    if 'connection' in locals(): connection.close()
