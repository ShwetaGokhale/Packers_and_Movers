import pymysql
import csv
from datetime import datetime
import pytz
from decimal import Decimal, InvalidOperation

# Set IST timezone
IST = pytz.timezone('Asia/Kolkata')
now = datetime.now(IST)

# Database config
# DB_CONFIG = {
#     'host': 'localhost',
#     'user': 'daapl_user',
#     'password': 'Daapl_User@123',
#     'database': 'daapl_new'
# }
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'daapl_data'
}

# CSV file path
CSV_FILE_PATH = 'CN_GOODS.csv'

# SQL insert query
insert_query = """
INSERT INTO accounts_goodsinfo (
    unit, quantity, rate, gi_amount,
    from_party_id, to_party_id, consignment_id,
    party_payment, paid_amount, created_at
) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

# Load valid CNIDs to enforce FK
def get_valid_cnids():
    try:
        conn = pymysql.connect(**DB_CONFIG)
        with conn.cursor() as cur:
            cur.execute("SELECT CNID FROM accounts_consignment")
            return {row[0] for row in cur.fetchall()}
    finally:
        conn.close()

valid_cnids = get_valid_cnids()

# Read and process CSV data
data = []
try:
    with open(CSV_FILE_PATH, mode='r', newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)

        for line_num, row in enumerate(reader, start=2):
            try:
                unit = row['unit'].strip()
                quantity = Decimal(row['quantity'].strip())
                rate = Decimal(row['rate'].strip())
                gi_amount = Decimal(row['gi_amount'].strip())
                from_party = int(row['from_party_id'].strip())
                to_party = int(row['to_party_id'].strip())
                consignment_id = int(row['consignment_id'].strip())

                if consignment_id not in valid_cnids:
                    raise ValueError(f"CNID {consignment_id} not found in DB")

                # Parse optional fields
                party_payment = None
                paid_amount = None

                if row['party_payment'].strip():
                    try:
                        party_payment = datetime.strptime(row['party_payment'].strip(), "%m/%d/%Y").date()
                    except ValueError:
                        raise ValueError(f"Invalid party_payment format in row {line_num}: {row['party_payment']}")

                if row['paid_amount'].strip():
                    try:
                        paid_amount = Decimal(row['paid_amount'].strip())
                    except InvalidOperation:
                        raise ValueError(f"Invalid paid_amount format in row {line_num}: {row['paid_amount']}")

                processed_row = [
                    unit, quantity, rate, gi_amount,
                    from_party, to_party, consignment_id,
                    party_payment, paid_amount, now
                ]

                data.append(tuple(processed_row))

            except Exception as e:
                print(f"❌ Error in row {line_num}: {e}")

except FileNotFoundError:
    print(f"❌ File not found: {CSV_FILE_PATH}")
    exit()

# Insert data into DB
try:
    connection = pymysql.connect(**DB_CONFIG)
    cursor = connection.cursor()
    connection.begin()
    cursor.executemany(insert_query, data)
    connection.commit()
    print(f"✅ Inserted {cursor.rowcount} records into accounts_goodsinfo.")

except Exception as e:
    if 'connection' in locals():
        connection.rollback()
    print(f"❌ DB Insert Error: {e}")

finally:
    if 'cursor' in locals():
        cursor.close()
    if 'connection' in locals():
        connection.close()
