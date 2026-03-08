import pandas as pd

# Load the data
print("Loading data from ny_for_sale.csv...")
df = pd.read_csv("ny_for_sale.csv")

print(f"Total properties loaded: {len(df)}")
print("\n" + "="*80)

# Show available columns
print("\n📊 Available columns for filtering:")
cols = df.columns.tolist()
for i, col in enumerate(cols, 1):
    print(f"  {i}. {col}")

print("\n" + "="*80)
print("Filtering for properties with specific features...")

# Filter by fields NOT available in API
filtered = df.copy()

# Stories filter (1-2 stories)
if 'stories' in df.columns:
    filtered = filtered[(filtered['stories'] >= 1) & (filtered['stories'] <= 2)]
    print(f"After stories filter (1-2): {len(filtered)} properties")

# Garage filter (has garage)
if 'garage' in df.columns:
    filtered = filtered[filtered['garage'] > 0]
    print(f"After garage filter (>0): {len(filtered)} properties")

# Pool filter (search in description)
if 'text' in df.columns:
    filtered = filtered[filtered['text'].str.contains('pool', case=False, na=False)]
    print(f"After pool filter: {len(filtered)} properties")

# Basement filter (search in description)
if 'text' in df.columns:
    filtered = filtered[filtered['text'].str.contains('basement', case=False, na=False)]
    print(f"After basement filter: {len(filtered)} properties")

print("\n" + "="*80)
print(f"\n✅ Final filtered properties: {len(filtered)}")
print("Properties with: pool AND basement AND garage AND 1-2 stories")

if len(filtered) > 0:
    print("\nSample results:")
    display_cols = ['formatted_address', 'list_price', 'beds', 'garage', 'stories', 'property_url']
    available_cols = [col for col in display_cols if col in filtered.columns]
    print(filtered[available_cols].head(10).to_string())
    
    # Save filtered results
    filtered.to_csv("ny_filtered_advanced.csv", index=False)
    print(f"\n✅ Saved {len(filtered)} properties to: ny_filtered_advanced.csv")
else:
    print("\n⚠️ No properties match all criteria. Try loosening some filters.")

print("\n" + "="*80)
print("\n💡 TIP: Edit this file to adjust filters:")
print("  • Change stories range")
print("  • Remove garage requirement")
print("  • Search for different keywords (pool, basement, renovated, etc.)")
print("  • Add price filters: filtered = filtered[(df['list_price'] >= 500000) & (df['list_price'] <= 800000)]")
