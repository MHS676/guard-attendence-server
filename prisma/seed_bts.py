import pandas as pd
import json

file_path = '(340) BTS DATABASE (Robi new Sims) Information.xls'

# Load Excel sheet
df_clean = pd.read_excel(file_path, sheet_name='Main Sheet_31 Jan_2022', skiprows=2)
df_clean.columns = [str(col).strip().replace('\n', ' ') for col in df_clean.columns]
df_sites = df_clean.dropna(subset=['Sl No']).copy()

records = []
for idx, row in df_sites.iterrows():
    records.append({
        "sl_no": int(row['Sl No']),
        "airtel_code": str(row['Airtel code']).strip() if pd.notna(row['Airtel code']) else None,
        "robi_code": str(row['Robi code']).strip() if pd.notna(row['Robi code']) else None,
        "site_type": str(row['Type of Site']).strip() if pd.notna(row['Type of Site']) else None,
        "district": str(row['District']).strip() if pd.notna(row['District']) else None,
        "thana": str(row['Thana']).strip() if pd.notna(row['Thana']) else None,
        "address": str(row['Address']).strip().replace('\n', ' ') if pd.notna(row['Address']) else None,
        "security_vendor": str(row['Security Vendor']).strip() if pd.notna(row['Security Vendor']) else None,
        "service_type": str(row['Service Type']).strip() if pd.notna(row['Service Type']) else None,
        "guards": str(row['Name & Cell No of Guards']).strip().replace('\n', ' ') if pd.notna(row['Name & Cell No of Guards']) else None,
        "supervisor": str(row['Name & Cell No of Incharge/S.Visor']).strip().replace('\n', ' ') if pd.notna(row['Name & Cell No of Incharge/S.Visor']) else None,
    })

# Export to JSON for Knex / Express Seeder
with open('bts_data.json', 'w', encoding='utf-8') as f:
    json.dump(records, f, indent=2, ensure_ascii=False)

print(f"Successfully exported {len(records)} BTS site records to bts_data.json")