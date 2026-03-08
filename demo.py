from homeharvest import scrape_property

properties = scrape_property(
    location="New York, NY",
    listing_type="for_sale",  # Current active listings
)

properties.to_csv("ny_for_sale.csv", index=False)
print(f"Found {len(properties)} properties")
