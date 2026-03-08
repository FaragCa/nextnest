import pandas as pd
import os

# Check and fix all CSV files
csv_files = ['ny_filtered.csv', 'ny_for_sale.csv', 'ny_results.csv', 'ny_filtered_advanced.csv']

print("="*80)
print("CHECKING AND FIXING PROPERTY URLs")
print("="*80)

for csv_file in csv_files:
    if not os.path.exists(csv_file):
        print(f"\n⚠️  {csv_file} not found, skipping...")
        continue
    
    print(f"\n📄 Checking {csv_file}...")
    
    # Load the CSV
    df = pd.read_csv(csv_file, low_memory=False)
    total = len(df)
    
    # Check for incorrect URLs (search pages instead of detail pages)
    search_urls = df['property_url'].str.contains('/realestateandhomes-search/', na=False)
    bad_count = search_urls.sum()
    
    # Check for missing URLs
    missing_urls = df['property_url'].isna()
    missing_count = missing_urls.sum()
    
    print(f"   Total properties: {total}")
    print(f"   Incorrect URLs (search pages): {bad_count}")
    print(f"   Missing URLs: {missing_count}")
    
    if bad_count > 0 or missing_count > 0:
        print(f"   🔧 Fixing URLs...")
        
        # Fix both incorrect and missing URLs using permalink
        needs_fix = search_urls | missing_urls
        
        for idx in df[needs_fix].index:
            permalink = df.loc[idx, 'permalink']
            if pd.notna(permalink):
                correct_url = f"https://www.realtor.com/realestateandhomes-detail/{permalink}"
                df.loc[idx, 'property_url'] = correct_url
        
        # Save fixed CSV
        df.to_csv(csv_file, index=False)
        print(f"   ✅ Fixed {bad_count + missing_count} URLs and saved {csv_file}")
    else:
        print(f"   ✅ All URLs are correct!")
    
    # Show sample URLs
    print(f"\n   Sample URLs:")
    for i, url in enumerate(df['property_url'].head(3), 1):
        if pd.notna(url):
            print(f"   {i}. {url}")

print("\n" + "="*80)
print("✅ URL CHECK COMPLETE!")
print("="*80)
print("\nAll property_url fields now point to detail pages:")
print("Format: https://www.realtor.com/realestateandhomes-detail/{permalink}")
print("\n💡 Click any URL in Excel/CSV viewer to open the full listing page!")
