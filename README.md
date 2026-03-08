# HomeHarvest Real Estate Search - Complete Guide

## Files Created:
1. **demo.py** - Simple search (currently searching all NY for-sale listings)
2. **search_with_filters.py** - Search WITH API filters (price, beds, baths, sqft, lot, year)
3. **search_rentals.py** - Search for rental properties
4. **analyze_data.py** - Filter downloaded CSV for pool, garage, basement, stories
5. **verify_links.py** - Verify property URLs work

## How to Use:

### Option 1: Search with API Filters (FASTEST)
```bash
python search_with_filters.py
```
**Filters at search time:**
- price_min, price_max
- beds_min, beds_max
- baths_min, baths_max
- sqft_min, sqft_max
- lot_sqft_min, lot_sqft_max
- year_built_min, year_built_max
- listing_type: "for_sale", "for_rent", "sold", "pending"

### Option 2: Download All, Then Filter (MORE FEATURES)
```bash
python demo.py              # Download all NY properties
python analyze_data.py      # Filter for pool, garage, basement, stories
```

## Available Data Fields:

### Property Details:
- beds, full_baths, half_baths
- sqft, lot_sqft
- year_built, stories
- style (SINGLE_FAMILY, COOP, CONDO, etc.)

### Pricing:
- list_price, list_price_min, list_price_max
- sold_price, last_sold_price
- price_per_sqft
- assessed_value, estimated_value
- tax, tax_history
- hoa_fee

### Location:
- formatted_address, street, unit, city, state, zip_code
- latitude, longitude
- neighborhoods, county

### Features (search in 'text' field):
- pool - search description for "pool"
- basement - search description for "basement"
- parking_garage - parking/garage info
- renovated, updated, new - search description

### Dates:
- list_date, pending_date, last_sold_date
- last_update_date, last_status_change_date
- days_on_mls

### Agent/Broker:
- agent_name, agent_email, agent_phones
- broker_name
- office_name, office_email, office_phones

### Links:
- property_url - Direct link to Realtor.com listing page ✅

## Examples:

### Search for Rentals:
```python
python search_rentals.py
```

### Custom Search:
Edit search_with_filters.py:
```python
properties = scrape_property(
    location="Manhattan, NY",  # or "Brooklyn, NY", "10001" (zip), etc.
    listing_type="for_sale",
    price_min=500000,
    price_max=2000000,
    beds_min=2,
    sqft_min=1000,
    lot_sqft_min=2000,
    year_built_min=2000,  # Only newer homes
    sort_by="list_price",
    sort_direction="asc"
)
```

### Filter for Pool + Basement:
Edit analyze_data.py to search descriptions:
```python
filtered = df[
    (df['text'].str.contains('pool', case=False, na=False)) &
    (df['text'].str.contains('basement', case=False, na=False)) &
    (df['stories'] <= 2) &
    (df['list_price'] >= 500000) &
    (df['list_price'] <= 1000000)
]
```

## Key Points:

✅ **Property URLs work** - Click links in CSV to view full listings
✅ **API filters** - Use during search for speed
✅ **Post-download filters** - Use for pool, garage, basement, renovated, etc.
✅ **Flexible locations** - City, zip code, neighborhood, full address
✅ **Multiple property types** - For sale, rent, sold, pending

## Current Data Files:
- ny_for_sale.csv (9,800 properties) - All NY for-sale listings
- ny_results.csv (2,302 properties) - Sold in last 30 days
- ny_filtered.csv (1,157 properties) - Filtered by price/beds/baths/sqft
- ny_filtered_advanced.csv (90 properties) - With pool + basement + garage
