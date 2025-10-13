import pymysql

# Match Django DB settings
DB_CONFIG = {
    'host': 'localhost',
    'user': 'daapl_user',
    'password': 'Daapl_User@123',
    'database': 'daapl_new',
    'port': 3306,
    'charset': 'utf8mb4'
}

TABLE_NAME = 'accounts_location'

try:
    connection = pymysql.connect(**DB_CONFIG)
    cursor = connection.cursor()

    # Disable FK checks (optional, in case there are related constraints)
    cursor.execute("SET FOREIGN_KEY_CHECKS=0;")

    # Delete all records
    cursor.execute(f"DELETE FROM {TABLE_NAME};")

    # Reset AUTO_INCREMENT
    cursor.execute(f"ALTER TABLE {TABLE_NAME} AUTO_INCREMENT = 1;")

    # Re-enable FK checks
    cursor.execute("SET FOREIGN_KEY_CHECKS=1;")

    connection.commit()
    print(f"✅ Table '{TABLE_NAME}' flushed successfully.")

except Exception as e:
    print(f"❌ Error: {e}")

finally:
    if 'cursor' in locals(): cursor.close()
    if 'connection' in locals(): connection.close()
