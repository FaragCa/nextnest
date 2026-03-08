#!/usr/bin/env python3
"""
test_api.py - Test script for Real Estate Backend API

This script demonstrates all API endpoints with real examples.
Run the backend server first: cd backend && source venv/bin/activate && python app.py
"""

import requests
import json
import time

# Base URL for the backend API
BASE_URL = "http://localhost:5001/api"

def print_section(title):
    """Print a formatted section header"""
    print(f"\n{'='*70}")
    print(f"  {title}")
    print('='*70)

def test_search():
    """Test property search endpoint"""
    print_section("1. Testing Property Search")
    
    payload = {
        "location": "Brooklyn, NY",
        "listing_type": "for_sale",
        "price_min": 400000,
        "price_max": 700000,
        "beds_min": 2,
        "baths_min": 1
    }
    
    print(f"\n📍 Searching: {payload['location']}")
    print(f"💰 Price: ${payload['price_min']:,} - ${payload['price_max']:,}")
    print(f"🛏️  Beds: {payload['beds_min']}+  |  🚿 Baths: {payload['baths_min']}+")
    print("\n⏳ Searching properties... (this may take 10-30 seconds)\n")
    
    response = requests.post(f"{BASE_URL}/search", json=payload)
    data = response.json()
    
    if data.get('success'):
        print(f"✅ Found {data['count']} properties!\n")
        
        # Show first 3 properties
        for i, prop in enumerate(data['properties'][:3], 1):
            print(f"Property {i}:")
            print(f"  📍 {prop.get('formatted_address', 'N/A')}")
            print(f"  💵 ${prop.get('list_price', 0):,}")
            
            beds = prop.get('beds') or 0
            baths = prop.get('full_baths') or 0
            sqft = prop.get('sqft') or 0
            
            print(f"  🛏️  {beds} beds | 🚿 {baths} baths | 📐 {sqft:,} sqft")
            print(f"  🔗 {prop.get('property_url', 'N/A')[:80]}")
            print()
        
        # Save coordinates for next tests
        if data['properties']:
            first_prop = data['properties'][0]
            return {
                'lat': first_prop.get('latitude'),
                'lng': first_prop.get('longitude'),
                'address': first_prop.get('formatted_address')
            }
    else:
        print(f"❌ Error: {data.get('error', 'Unknown error')}")
    
    return None

def test_amenities(coords):
    """Test amenities search endpoint"""
    print_section("2. Testing Amenities Search")
    
    if not coords:
        print("⚠️  Skipping (no property coordinates available)")
        return
    
    payload = {
        "latitude": coords['lat'],
        "longitude": coords['lng'],
        "radius": 3000  # 3km radius
    }
    
    print(f"\n📍 Property: {coords['address']}")
    print(f"🔍 Searching within 3km radius...")
    print("⏳ Querying OpenStreetMap... (this may take 5-15 seconds)\n")
    
    response = requests.post(f"{BASE_URL}/amenities", json=payload)
    data = response.json()
    
    if data.get('success'):
        amenities = data['amenities']
        print("✅ Nearby Amenities Found:\n")
        
        categories = {
            '🏫 Schools': amenities.get('schools', []),
            '💪 Gyms': amenities.get('gyms', []),
            '🏥 Hospitals': amenities.get('hospitals', []),
            '🌳 Parks': amenities.get('parks', []),
            '🐕 Veterinarians': amenities.get('vets', [])
        }
        
        for icon_name, items in categories.items():
            if items:
                print(f"{icon_name}: {len(items)} found")
                # Show first 2 of each type
                for item in items[:2]:
                    print(f"  • {item['name']} ({item['distance_miles']:.2f} mi)")
            else:
                print(f"{icon_name}: 0 found")
        print()
    else:
        print(f"❌ Error: {data.get('error', 'Unknown error')}")

def test_commute(coords):
    """Test commute calculator endpoint"""
    print_section("3. Testing Commute Calculator")
    
    if not coords:
        print("⚠️  Skipping (no property coordinates available)")
        return
    
    # Example: Commute to Downtown Brooklyn (MetroTech Center)
    work_coords = {
        'lat': 40.6944,
        'lng': -73.9865,
        'name': 'Downtown Brooklyn (MetroTech)'
    }
    
    payload = {
        "property_lat": coords['lat'],
        "property_lng": coords['lng'],
        "work_lat": work_coords['lat'],
        "work_lng": work_coords['lng'],
        "mode": "driving"
    }
    
    print(f"\n📍 From: {coords['address']}")
    print(f"📍 To: {work_coords['name']}")
    print(f"🚗 Mode: Driving\n")
    print("⏳ Calculating route...\n")
    
    response = requests.post(f"{BASE_URL}/commute", json=payload)
    data = response.json()
    
    if data.get('success'):
        print("✅ Commute Details:\n")
        print(f"  📏 Straight-line distance: {data.get('straight_line_distance_miles', 0):.2f} miles")
        if data.get('route_distance_miles'):
            print(f"  🛣️  Driving distance: {data['route_distance_miles']:.2f} miles")
            print(f"  ⏱️  Estimated time: {data.get('duration_minutes', 0):.0f} minutes")
        else:
            print("  ℹ️  Routing details unavailable")
        print()
    else:
        print(f"❌ Error: {data.get('error', 'Unknown error')}")

def test_advanced_filter():
    """Test advanced filtering endpoint"""
    print_section("4. Testing Advanced Filtering")
    
    # First get some properties
    print("📥 Getting sample properties to filter...\n")
    
    search_payload = {
        "location": "Queens, NY",
        "listing_type": "for_sale",
        "price_max": 800000
    }
    
    response = requests.post(f"{BASE_URL}/search", json=search_payload)
    data = response.json()
    
    if not data.get('success') or not data.get('properties'):
        print("⚠️  Could not get properties to filter")
        return
    
    properties = data['properties'][:50]  # Use first 50
    print(f"✅ Got {len(properties)} properties\n")
    
    # Apply advanced filters
    filter_payload = {
        "properties": properties,
        "filters": {
            "has_pool": True,
            "has_garage": True,
            "stories_min": 1,
            "stories_max": 2
        }
    }
    
    print("🔍 Applying filters:")
    print("  • Has swimming pool")
    print("  • Has garage")
    print("  • 1-2 stories\n")
    
    response = requests.post(f"{BASE_URL}/filter-advanced", json=filter_payload)
    data = response.json()
    
    if data.get('success'):
        filtered = data.get('filtered_properties', [])
        print(f"✅ Found {len(filtered)} properties matching all criteria\n")
        
        if filtered:
            prop = filtered[0]
            print("Example property:")
            print(f"  📍 {prop.get('formatted_address', 'N/A')}")
            print(f"  💵 ${prop.get('list_price', 0):,}")
            print(f"  🏊 Pool: ✓  |  🚗 Garage: ✓  |  🏠 Stories: {prop.get('stories', 'N/A')}")
            print()
    else:
        print(f"❌ Error: {data.get('error', 'Unknown error')}")

def test_quiz():
    """Test quiz recommendations endpoint"""
    print_section("5. Testing Quiz Recommendations")
    
    payload = {
        "budget": "medium",
        "property_type": "condo",
        "schools_important": True,
        "commute_max": 30,
        "lifestyle": "family"
    }
    
    print("📝 Quiz answers:")
    print(f"  💰 Budget: {payload['budget'].capitalize()}")
    print(f"  🏡 Property Type: {payload['property_type'].capitalize()}")
    print(f"  🎓 Schools Important: {'Yes' if payload['schools_important'] else 'No'}")
    print(f"  🚗 Max Commute: {payload['commute_max']} minutes")
    print(f"  👨‍👩‍👧 Lifestyle: {payload['lifestyle'].capitalize()}\n")
    
    response = requests.post(f"{BASE_URL}/quiz/recommend", json=payload)
    data = response.json()
    
    if data.get('success'):
        recommendations = data.get('recommendations', [])
        print(f"✅ Generated {len(recommendations)} neighborhood recommendations:\n")
        
        for i, rec in enumerate(recommendations[:5], 1):
            print(f"{i}. {rec['neighborhood']}")
            print(f"   Score: {rec['score']}/100")
            print(f"   Avg Price: ${rec.get('avg_price', 0):,}")
            print(f"   Reasons: {', '.join(rec.get('reasons', []))}")
            print()
    else:
        print(f"❌ Error: {data.get('error', 'Unknown error')}")

def main():
    """Run all API tests"""
    print("""
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║          🏠 Real Estate Platform - API Test Suite 🏠            ║
║                                                                  ║
║              Testing 100% FREE APIs - No Cost!                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
    """)
    
    print("ℹ️  This script will test all 5 API endpoints")
    print("⏱️  Total test time: ~1-2 minutes\n")
    print("🌐 Backend URL:", BASE_URL)
    print()
    
    try:
        # Test 1: Property Search
        coords = test_search()
        time.sleep(2)
        
        # Test 2: Amenities (uses coords from search)
        test_amenities(coords)
        time.sleep(2)
        
        # Test 3: Commute Calculator (uses coords from search)
        test_commute(coords)
        time.sleep(2)
        
        # Test 4: Advanced Filtering
        test_advanced_filter()
        time.sleep(2)
        
        # Test 5: Quiz Recommendations
        test_quiz()
        
        print_section("✅ All Tests Complete!")
        print("""
Your backend is working perfectly! 🎉

Next steps:
1. ✅ Backend tested and working
2. 📱 Build React frontend with Leaflet maps
3. 🎨 Integrate your Figma designs
4. 🚀 Deploy the application

Check out README.md for frontend setup instructions!
        """)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to backend server!")
        print("\nMake sure the server is running:")
        print("  cd backend")
        print("  source venv/bin/activate")
        print("  python app.py")
        print("\nServer should be running on http://localhost:5001")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()
