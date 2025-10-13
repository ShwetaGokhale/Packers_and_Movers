import pymysql
import csv
from datetime import datetime

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'daapl_data'
}

CSV_FILE_PATH = 'CN_DATA.csv'

insert_query = """
INSERT INTO accounts_consignment (
    CNID, Cn_No, from_location, To_Location, Booking_Date, Loading_Date, Unloading_Date, Truck_Freight, Advance_Amount, Balance_Amount, Innam, Extra_TF, total_fare, consignee_id, consigner_id, Vehicle_No_id, created_at
) VALUES (
    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
)
"""

def parse_date(date_str):
    if not date_str or date_str.strip() == "":
        return None
    date_str = date_str.strip()
    for fmt in ("%m/%d/%Y", "%m-%d-%Y", "%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None

def to_float(value):
    try:
        return float(value)
    except (ValueError, TypeError):
        return 0.0

def to_int_or_none(value):
    if value is None or str(value).strip() == "":
        return None
    try:
        return int(value)
    except ValueError:
        return None

def insert_data():
    conn = None
    try:
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()

        with open(CSV_FILE_PATH, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            reader.fieldnames = [name.strip() for name in reader.fieldnames]

            for row in reader:
                try:
                    data = (
                        to_int_or_none(row.get('CNID')),
                        row.get('Cn_No') or None,
                        to_int_or_none(row.get('from_location')),
                        to_int_or_none(row.get('To_Location')),
                        parse_date(row.get('Booking_Date')),
                        parse_date(row.get('Loading_Date')),
                        parse_date(row.get('Unloading_Date')),
                        to_float(row.get('Truck_Freight')),
                        to_float(row.get('Advance_Amount')),
                        to_float(row.get('Balance_Amount')),
                        to_int_or_none(row.get('Innam')),
                        to_float(row.get('Extra_TF')),
                        to_float(row.get('total_fare')),
                        to_int_or_none(row.get('consignee_id')),
                        to_int_or_none(row.get('consigner_id')),
                        to_int_or_none(row.get('Vehicle_No_id')),
                        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    )
                    cursor.execute(insert_query, data)
                except Exception as e:
                    print(f"Error inserting row: {e}")

        conn.commit()

    except Exception as e:
        print(f"Database connection error: {e}")

    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    insert_data()
