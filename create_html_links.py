import pandas as pd

print("Creating HTML file with clickable property links...")

# Load the filtered data
df = pd.read_csv('ny_filtered.csv', low_memory=False)

# Create HTML content
html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>NY Property Listings - Clickable Links</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #333;
        }
        .property {
            background-color: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .address {
            font-size: 18px;
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 5px;
        }
        .details {
            color: #666;
            margin: 5px 0;
        }
        .price {
            font-size: 20px;
            color: #00aa00;
            font-weight: bold;
        }
        a {
            color: #0066cc;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .link-button {
            display: inline-block;
            background-color: #0066cc;
            color: white;
            padding: 8px 15px;
            border-radius: 3px;
            margin-top: 10px;
            text-decoration: none;
        }
        .link-button:hover {
            background-color: #0052a3;
        }
    </style>
</head>
<body>
    <h1>New York Property Listings - Clickable Links</h1>
    <p><strong>Total Properties:</strong> """ + str(len(df)) + """</p>
    <p><strong>Instructions:</strong> Click any "View Listing" button to open the property details on Realtor.com</p>
    <hr>
"""

# Add first 50 properties (to keep file size reasonable)
for idx, row in df.head(50).iterrows():
    price = f"${row['list_price']:,.0f}" if pd.notna(row['list_price']) else "N/A"
    beds = f"{int(row['beds'])}" if pd.notna(row['beds']) else "N/A"
    baths = f"{int(row['full_baths'])}" if pd.notna(row['full_baths']) else "N/A"
    sqft = f"{int(row['sqft']):,}" if pd.notna(row['sqft']) else "N/A"
    
    html_content += f"""
    <div class="property">
        <div class="address">{row['formatted_address']}</div>
        <div class="price">{price}</div>
        <div class="details">
            🛏️ {beds} beds | 🛁 {baths} baths | 📐 {sqft} sqft | 📅 Status: {row['status']}
        </div>
        <a href="{row['property_url']}" target="_blank" class="link-button">
            🔗 View Listing on Realtor.com
        </a>
    </div>
    """

html_content += """
    <hr>
    <p><em>Showing first 50 properties. Open the CSV files for complete data.</em></p>
</body>
</html>
"""

# Save HTML file
with open('property_links.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("✅ HTML file created: property_links.html")
print("\n📝 To test the links:")
print("   1. Open property_links.html in your web browser")
print("   2. Click any 'View Listing' button")
print("   3. The listing detail page should open on Realtor.com")
print("\n⚠️  If you see a search page instead:")
print("   - The listing may have been sold/removed")
print("   - Try a different property from the list")
print("   - The data was scraped on March 6, 2026")
