from homeharvest import scrape_property

# FOR SALE properties with ALL available API filters
print("Searching for properties with filters...")
properties = scrape_property(
    location="New York, NY",
    listing_type="for_sale",  # Options: for_sale, for_rent, sold, pending
    
    # Price filters
    price_min=300000,
    price_max=1000000,
    
    # Bedroom/Bathroom filters
    beds_min=2,
    beds_max=4,
    baths_min=1.0,
    baths_max=3.0,
    
    # Size filters
    sqft_min=800,
    sqft_max=2500,
    lot_sqft_min=1000,  # Lot size in square feet
    
    # Year built filter
    year_built_min=1950,
    
    # Sorting
    sort_by="list_price",  # Options: list_price, list_date, sqft, beds, baths
    sort_direction="asc",  # asc = lowest first, desc = highest first
    
    # Limit results (max 10,000)
    limit=10000
)

properties.to_csv("ny_filtered.csv", index=False)
print(f"\n✅ Found {len(properties)} properties matching your criteria")
if len(properties) > 0:
    print(f"\nPrice Range: ${properties['list_price'].min():,.0f} - ${properties['list_price'].max():,.0f}")
    print(f"Bedrooms: {properties['beds'].min():.0f} - {properties['beds'].max():.0f}")
    print(f"Bathrooms: {properties['full_baths'].min():.0f} - {properties['full_baths'].max():.0f}")
print(f"\nData saved to: ny_filtered.csv")

print("\n" + "="*60)
print("📋 AVAILABLE API FILTERS:")
print("  ✓ price_min, price_max")
print("  ✓ beds_min, beds_max")
print("  ✓ baths_min, baths_max")
print("  ✓ sqft_min, sqft_max")
print("  ✓ lot_sqft_min, lot_sqft_max")
print("  ✓ year_built_min, year_built_max")
print("  ✓ sort_by, sort_direction")
print("  ✓ listing_type (for_sale, for_rent, sold, pending)")
