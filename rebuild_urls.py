import pandas as pd
import os

# List of CSV files to fix
csv_files = ['ny_filtered.csv', 'ny_for_sale.csv', 'ny_results.csv', 'ny_filtered_advanced.csv']

print("="*80)
print("REBUILDING ALL PROPERTY URLs FROM PERMALINK")
print("="*80)

for csv_file in csv_files:
    if not os.path.exists(csv_file):
        print(f"\n⚠️  {csv_file} not found, skipping...")
        continue
    
    print(f"\n📄 Processing {csv_file}...")
    
    # Load the CSV
    df = pd.read_csv(csv_file, low_memory=False)
    total = len(df)
    
    print(f"   Total properties: {total}")
    print(f"   Rebuilding all URLs from permalink field...")
    
    # Rebuild ALL URLs from permalink to ensure consistency
    fixed_count = 0
    for idx in df.index:
        permalink = df.loc[idx, 'permalink']
        if pd.notna(permalink):
            # Build the correct detail page URL
            correct_url = f"https://www.realtor.com/realestateandhomes-detail/{permalink}"
            df.loc[idx, 'property_url'] = correct_url
            fixed_count += 1
    
    # Save the fixed CSV
    backup_file = csv_file.replace('.csv', '_backup.csv')
    
    # Create backup of original
    if not os.path.exists(backup_file):
        df_backup = pd.read_csv(csv_file, low_memory=False)
        df_backup.to_csv(backup_file, index=False)
        print(f"   💾 Backup saved to: {backup_file}")
    
    # Save the corrected file
    df.to_csv(csv_file, index=False)
    print(f"   ✅ Rebuilt {fixed_count} URLs")
    
    # Show sample URLs
    print(f"\n   Sample URLs (first 3):")
    for i, row in df.head(3).iterrows():
        if pd.notna(row['property_url']):
            print(f"   {i+1}. {row['formatted_address']}")
            print(f"      {row['property_url']}")

# Test the 6316 address specifically
print("\n" + "="*80)
print("TESTING SPECIFIC PROPERTY: 6316 77th St")
print("="*80)

df = pd.read_csv('ny_filtered.csv', low_memory=False)
test_row = df[df['formatted_address'].str.contains('6316', na=False)]

if len(test_row) > 0:
    row = test_row.iloc[0]
    print(f"\nAddress: {row['formatted_address']}")
    print(f"Status: {row['status']}")
    print(f"Property URL: {row['property_url']}")
    print(f"\n✅ This URL should open the detail page!")
    print("   If it redirects to a search page, the listing may have been")
    print("   removed, sold, or is temporarily unavailable on Realtor.com")

print("\n" + "="*80)
print("✅ URL REBUILD COMPLETE!")
print("="*80)
print("\n💡 All URLs rebuilt in format:")
print("   https://www.realtor.com/realestateandhomes-detail/{permalink}")
print("\n📝 Note: Backups saved as *_backup.csv")
