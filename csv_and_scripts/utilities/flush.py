import pymysql

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'dhanlakshmi_new'
}

TABLES = ['accounts_consignment']  # delete from child first, then parent

try:
    connection = pymysql.connect(**DB_CONFIG)
    cursor = connection.cursor()

    for table in TABLES:
        # Step 1: Delete all records
        cursor.execute(f"DELETE FROM {table}")

        # Step 2: Reset AUTO_INCREMENT to 1
        cursor.execute(f"ALTER TABLE {table} AUTO_INCREMENT = 1")

        print(f"✅ Table '{table}' cleared and AUTO_INCREMENT reset to 1.")

    connection.commit()

except Exception as e:
    print(f"❌ Error: {e}")

finally:
    if 'cursor' in locals(): cursor.close()
    if 'connection' in locals(): connection.close()
