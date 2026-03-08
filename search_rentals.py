from homeharvest import scrape_property

# RENTAL properties
print("Searching for rental properties...")
rentals = scrape_property(
    location="New York, NY",
    listing_type="for_rent",  # FOR RENT
    
    # Rental price filters (monthly rent)
    price_min=2000,
    price_max=5000,
    
    # Bedroom/Bathroom filters
    beds_min=1,
    beds_max=3,
    baths_min=1.0,
    
    # Size filter
    sqft_min=600,
    
    # Sorting by price
    sort_by="list_price",
    sort_direction="asc",
    
    limit=10000
)

rentals.to_csv("ny_rentals.csv", index=False)
print(f"\n✅ Found {len(rentals)} RENTAL properties")
if len(rentals) > 0:
    print(f"Rent Range: ${rentals['list_price'].min():,.0f} - ${rentals['list_price'].max():,.0f}/month")
    print(f"Bedrooms: {rentals['beds'].min():.0f} - {rentals['beds'].max():.0f}")
print(f"\nData saved to: ny_rentals.csv")
