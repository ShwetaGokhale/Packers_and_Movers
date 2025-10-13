import pymysql
import csv
from datetime import datetime

# --- Database configuration ---
# DB_CONFIG = {
#     'host': 'localhost',
#     'user': 'root',
#     'password': 'Daapl_User@123',
#     'database': 'daapl_new'
# }
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'daapl_data'
}

# --- CSV file path ---
CSV_FILE_PATH = 'CN_DATA.csv'

# --- SQL insert query ---
insert_query = """
INSERT INTO accounts_consignment (
    CNID, Vehicle_No_id, Cn_No, consignee_id, consigner_id,
    from_location, To_Location, Booking_Date, Loading_Date, Unloading_Date,
    Truck_Freight, Advance_Amount, Balance_Amount, Innam, Extra_TF,
    total_fare, created_at
) VALUES (
    %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s,
    %s, %s
)
"""

# --- Date parsing ---
def parse_date(date_str):
    if not date_str or date_str.strip() == "":
        return None
    date_str = date_str.strip()
    for fmt in ("%m/%d/%Y", "%m-%d-%Y", "%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    print(f"⚠️ Invalid date format: {date_str}")
    return None

# --- Convert to float ---
def to_float(value):
    try:
        return float(value)
    except (ValueError, TypeError):
        return 0.0

# --- Convert to int or None ---
def to_int_or_none(value):
    if value is None or str(value).strip() == "":
        return None
    try:
        return int(value)
    except ValueError:
        return None

# --- Main data insert function ---
def insert_data():
    try:
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()

        with open(CSV_FILE_PATH, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            reader.fieldnames = [name.strip() for name in reader.fieldnames]

            success_count = 0
            row_number = 1  # Start from row 1 (header is not counted)

            for row in reader:
                row_number += 1
                created_at_value = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                try:
                    data = (
                        to_int_or_none(row.get('CNID')),
                        to_int_or_none(row.get('Vehicle_No_id')),
                        row.get('Cn_No') or None,
                        to_int_or_none(row.get('consignee_id')),
                        to_int_or_none(row.get('consigner_id')),
                        row.get('from_location') or '',
                        row.get('To_Location') or '',
                        parse_date(row.get('Booking_Date')),
                        parse_date(row.get('Loading_Date')),
                        parse_date(row.get('Unloading_Date')),
                        to_float(row.get('Truck_Freight')),
                        to_float(row.get('Advance_Amount')),
                        to_float(row.get('Balance_Amount')),
                        row.get('Innam') or '',
                        to_float(row.get('Extra_TF')),
                        to_float(row.get('total_fare')),
                        created_at_value
                    )

                    cursor.execute(insert_query, data)
                    success_count += 1
                except Exception as e:
                    print(f"❌ Error at CSV row {row_number}: {e}")
                    print(f"🚫 Failed Data: {data}\n")
                    continue

        conn.commit()
        print(f"\n✅ Successfully inserted {success_count} records out of {row_number - 1} rows.\n")

    except Exception as e:
        print(f"❌ Database connection failed: {e}")

    finally:
        if conn:
            conn.close()

# --- Run script ---
if __name__ == "__main__":
    insert_data()
