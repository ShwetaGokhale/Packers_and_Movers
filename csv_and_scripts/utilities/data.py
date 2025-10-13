import pandas as pd
import pymysql
import os

def get_user_choice():
    print("Press 1 to start importing data to database")
    return input("Enter your choice: ").strip()

def connect_db():
    return pymysql.connect(
        host="localhost",
        user="root",
        password="root",  # Use your actual MySQL password
        database="dhanlakshmi"
    )

def get_excel_columns(excel_file):
    df = pd.read_excel(excel_file, nrows=0)  # Get only headers
    return list(df.columns)

def get_db_columns(table_name, conn):
    cursor = conn.cursor()
    cursor.execute(f"DESCRIBE {table_name}")
    return [row[0] for row in cursor.fetchall()]

def map_columns_manually(db_columns, excel_columns):
    print("\n Start Mapping Database Columns to Excel Columns")
    mapping = {}
    print(f"\nAvailable Excel Columns:\n{excel_columns}\n")
    for db_col in db_columns:
        print(f"🔹 Database Column: {db_col}")
        ex_col = input(f"Enter Excel column to map to '{db_col}' (or leave blank to skip): ").strip()
        if ex_col in excel_columns:
            mapping[ex_col] = db_col
        else:
            print(f" Skipped mapping for '{db_col}'")
    return mapping

def import_data(excel_file, table_name, column_mapping, db_conn):
    df = pd.read_excel(excel_file)

    try:
        df = df[list(column_mapping.keys())]
        df.rename(columns=column_mapping, inplace=True)
    except KeyError as e:
        print(f" Missing Excel column: {e}")
        return

    db_columns = ", ".join(df.columns)
    placeholders = ", ".join(["%s"] * len(df.columns))
    insert_sql = f"INSERT INTO {table_name} ({db_columns}) VALUES ({placeholders})"

    cursor = db_conn.cursor()
    for _, row in df.iterrows():
        cursor.execute(insert_sql, tuple(row))
    db_conn.commit()
    print(f" {len(df)} rows inserted into `{table_name}`.")

def main():
    if get_user_choice() != '1':
        print("Exited.")
        return

    excel_file = "RAJASTHAN GT 25.xlsx"
    if not os.path.exists(excel_file):
        print(" Excel file not found.")
        return

    try:
        conn = connect_db()
        cursor = conn.cursor()

        # List tables
        cursor.execute("SHOW TABLES")
        tables = [row[0] for row in cursor.fetchall()]
        print("\n Available Tables:")
        for i, table in enumerate(tables):
            print(f"{i + 1}. {table}")
        choice = int(input("Enter table number to import into: ")) - 1
        table_name = tables[choice]
        print(f"\n Selected Table: {table_name}")

        db_columns = get_db_columns(table_name, conn)
        excel_columns = get_excel_columns(excel_file)

        column_mapping = map_columns_manually(db_columns, excel_columns)
        import_data(excel_file, table_name, column_mapping, conn)

        conn.close()
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
