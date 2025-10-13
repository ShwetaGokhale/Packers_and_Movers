import pymysql
import csv

# Database connection configuration
# DB_CONFIG = {
#     'host': 'localhost',
#     'user': 'root',
#     'password': 'root',
#     'database': 'dhanlakshmi_new'
# }
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'daapl_data'
}
# Path to your CSV file
CSV_FILE_PATH = 'consignee.csv'

# SQL insert query
insert_query = """
INSERT INTO accounts_consignee (
    id, consignee_name, date_added, consignee_address
) VALUES (
    %s, %s, %s, %s
)
"""

# Read data from CSV
data = []
try:
    with open(CSV_FILE_PATH, mode='r', newline='', encoding='utf-8') as file:
        reader = csv.reader(file)
        next(reader)  # Skip header

        for row in reader:
            if len(row) < 4:
                print(f"⚠️ Skipping incomplete row: {row}")
                continue

            try:
                processed_row = [
                    int(row[0]),              # id
                    row[1].strip(),           # consignee_name
                    row[2].strip(),           # date_added (already in YYYY-MM-DD)
                    row[3].strip()            # consignee_address
                ]
                data.append(tuple(processed_row))

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
