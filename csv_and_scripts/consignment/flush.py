import pymysql

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'daapl_new'
}

TABLES = ['accounts_consignment']  # Delete from parent only, skipping child (goodsinfo)

try:
    connection = pymysql.connect(**DB_CONFIG)
    cursor = connection.cursor()

    # 🚫 Disable foreign key checks temporarily
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")

    for table in TABLES:
        # Step 1: Delete all records
        cursor.execute(f"DELETE FROM {table}")

        # Step 2: Reset AUTO_INCREMENT to 1
        cursor.execute(f"ALTER TABLE {table} AUTO_INCREMENT = 1")

        print(f"✅ Table '{table}' cleared and AUTO_INCREMENT reset to 1.")

    # ✅ Re-enable foreign key checks
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")

    connection.commit()

except Exception as e:
    print(f"❌ Error: {e}")

finally:
    if 'cursor' in locals(): cursor.close()
    if 'connection' in locals(): connection.close()
