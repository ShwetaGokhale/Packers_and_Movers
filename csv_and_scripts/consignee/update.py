import pymysql
import csv

# Database connection configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'daaple_user',
    'password': 'Daaple@@2025',
    'database': 'daaple_data'
}
# Path to your CSV file
CSV_FILE_PATH = 'update.csv'

# SQL insert query (exclude 'id' column for auto-increment)
insert_query = """
INSERT INTO accounts_consignee (
    consignee_name, date_added, consignee_address
) VALUES (
    %s, %s, %s
)
"""

# Constants
DEFAULT_DATE = '2024-11-30'
DEFAULT_ADDRESS = 'Rajasthan'

# Read data from CSV
data = []
try:
    with open(CSV_FILE_PATH, mode='r', newline='', encoding='utf-8') as file:
        reader = csv.reader(file)
        next(reader)  # Skip header

        for row in reader:
            if not row or len(row) < 1:
                print(f"⚠️ Skipping empty or incomplete row: {row}")
                continue

            try:
                consignee_name = row[0].strip()
                processed_row = (consignee_name, DEFAULT_DATE, DEFAULT_ADDRESS)
                data.append(processed_row)

            except Exception as row_error:
                print(f"❌ Error in row {row}: {row_error}")

except FileNotFoundError:
    print(f"❌ CSV file not found: {CSV_FILE_PATH}")
    exit()

# Insert into database
try:
    connection = pymysql.connect(**DB_CONFIG)
    cursor = connection.cursor()
    cursor.executemany(insert_query, data)
    connection.commit()
    print(f"✅ Successfully inserted {cursor.rowcount} records into accounts_consignee.")

except Exception as e:
    print(f"❌ Error during DB insert: {e}")

finally:
    if 'cursor' in locals(): cursor.close()
    if 'connection' in locals(): connection.close()
