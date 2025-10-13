import pymysql
import csv

# DB config
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'dhanlakshmi'
}

CSV_FILE_PATH = 'consignment.csv'

# Dictionary to store CNID mapped to consignee_id
cnid_consignee_map = {}

try:
    with open(CSV_FILE_PATH, mode='r', newline='', encoding='utf-8') as file:
        reader = csv.reader(file)
        next(reader)  # Skip header

        for row in reader:
            if len(row) < 4:
                continue
            try:
                cnid = int(row[0])
                consignee_id = int(row[3])
                cnid_consignee_map[cnid] = consignee_id
            except ValueError:
                print(f"⚠️ Invalid data in row: {row}")

except FileNotFoundError:
    print(f"❌ CSV file not found: {CSV_FILE_PATH}")
    exit()

# Check which consignee_ids are missing in DB
missing_entries = []

try:
    connection = pymysql.connect(**DB_CONFIG)
    cursor = connection.cursor()

    for cnid, consignee_id in cnid_consignee_map.items():
        cursor.execute("SELECT id FROM accounts_consignee WHERE id = %s", (consignee_id,))
        result = cursor.fetchone()
        if not result:
            missing_entries.append((cnid, consignee_id))

    cursor.close()
    connection.close()

except Exception as e:
    print(f"❌ DB error: {e}")
    exit()

# Output
if missing_entries:
    print("❌ Missing consignee_ids in accounts_consignee table:")
    for cnid, cid in missing_entries:
        print(f" - CNID: {cnid}, Missing Consignee ID: {cid}")
else:
    print("✅ All consignee_ids from CSV exist in the database.")
