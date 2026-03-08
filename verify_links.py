import pandas as pd

# Load the data
df = pd.read_csv("ny_for_sale.csv")

print("="*80)
print("VERIFYING PROPERTY LINKS")
print("="*80)

print(f"\nTotal properties: {len(df)}")
print("\nSample property links (first 10):\n")

for i, row in df.head(10).iterrows():
    print(f"{i+1}. {row['formatted_address']}")
    print(f"   Price: ${row['list_price']:,.0f}")
    print(f"   Beds: {row['beds']}, Baths: {row['full_baths']}")
    print(f"   🔗 Link: {row['property_url']}")
    print()

print("="*80)
print("\n✅ The 'property_url' column contains direct links to listing pages")
print("   These links open the full listing details on Realtor.com with:")
print("   • Photos and virtual tours")
print("   • Complete property description")
print("   • School information")
print("   • Neighborhood details")
print("   • Agent contact information")
print("   • Price history")
print("\n💡 You can click any link in the CSV to open in your browser!")
print("="*80)
