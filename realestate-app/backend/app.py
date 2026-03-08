from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sys
import os
import re

# Add parent directory to path to import homeharvest
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from homeharvest import scrape_property
import requests
import math
import pandas as pd

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
CORS(app)  # Enable CORS for React frontend

@app.after_request
def add_no_cache_headers(response):
    if request.path.startswith('/api/'):
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
    return response

# ============================================================================
# PROPERTY SEARCH (Using HomeHarvest - FREE!)
# ============================================================================

@app.route('/api/search', methods=['POST'])
def search_properties():
    """
    Search properties using HomeHarvest
    Body: {
        location: "New York, NY" or zip code or address,
        listing_type: "for_sale" | "for_rent" | "sold" | "pending",
        price_min, price_max, beds_min, beds_max, baths_min,
        sqft_min, sqft_max, lot_sqft_min, year_built_min
    }
    """
    try:
        data = request.json
        print(f"Search request: {data}")
        
        properties = scrape_property(
            location=data.get('location', 'New York, NY'),
            listing_type=data.get('listing_type', 'for_sale'),
            price_min=data.get('price_min'),
            price_max=data.get('price_max'),
            beds_min=data.get('beds_min'),
            beds_max=data.get('beds_max'),
            baths_min=data.get('baths_min'),
            baths_max=data.get('baths_max'),
            sqft_min=data.get('sqft_min'),
            sqft_max=data.get('sqft_max'),
            lot_sqft_min=data.get('lot_sqft_min'),
            year_built_min=data.get('year_built_min'),
            sort_by=data.get('sort_by', 'list_price'),
            sort_direction=data.get('sort_direction', 'asc'),
            limit=10000
        )
        
        # Replace NaT/NaN with None so JSON serialization works
        properties = properties.astype(object).where(properties.notna(), None)
        result = properties.to_dict('records')
        print(f"Found {len(result)} properties")
        
        return jsonify({
            'success': True,
            'count': len(result),
            'properties': result
        })
        
    except Exception as e:
        print(f"Error in search: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================================================
# NEARBY AMENITIES (Using OpenStreetMap Overpass API - FREE!)
# ============================================================================

def search_nyc_schools(lat, lng, radius_meters=1600):
    """Search for NYC public schools near coordinates using NYC Open Data SODA API"""
    try:
        url = "https://data.cityofnewyork.us/resource/p6h4-mpyy.json"
        params = {
            "$where": f"within_circle(location_1, {lat}, {lng}, {radius_meters})",
            "$limit": 10,
            "$select": "ats_system_code,location_name,location_category_description,grades_final_text,primary_address_line_1,location_1"
        }
        response = requests.get(url, params=params, timeout=15)
        data = response.json()

        if isinstance(data, dict) and data.get('error'):
            raise Exception(data.get('message', 'NYC Open Data error'))

        results = []
        for school in data:
            loc = school.get('location_1', {})
            if not loc:
                continue
            s_lat = float(loc.get('latitude', 0))
            s_lng = float(loc.get('longitude', 0))
            distance = haversine_distance(lat, lng, s_lat, s_lng)

            name = school.get('location_name', 'Unknown School')
            dbn = school.get('ats_system_code', '').strip()
            category = school.get('location_category_description', '')
            grades = school.get('grades_final_text', '')
            address = school.get('primary_address_line_1', '')

            # Generate nycschoolsratings.com URL slug from DBN + name
            name_slug = re.sub(r'[^a-z0-9\s-]', '', name.lower()).strip()
            name_slug = re.sub(r'\s+', '-', name_slug)
            slug = f"{dbn.lower()}-{name_slug}"

            results.append({
                'name': name,
                'dbn': dbn,
                'category': category,
                'grades': grades,
                'address': address,
                'lat': s_lat,
                'lng': s_lng,
                'distance_miles': round(distance, 2),
                'ratings_url': f"https://nycschoolsratings.com/school/{slug}",
            })

        results.sort(key=lambda x: x['distance_miles'])
        return results[:4]
    except Exception as e:
        print(f"NYC school search failed, falling back to OSM: {e}")
        return search_osm(lat, lng, 'school', radius_meters)


@app.route('/api/amenities', methods=['POST'])
def get_amenities():
    """
    Get nearby amenities using OpenStreetMap
    Body: { latitude, longitude, radius: 3000 (meters) }
    """
    try:
        data = request.json
        lat = data['latitude']
        lng = data['longitude']
        radius = data.get('radius', 3000)
        
        amenities = {
            'schools': search_nyc_schools(lat, lng),
            'hospitals': search_osm(lat, lng, 'hospital', radius),
            'gyms': search_osm(lat, lng, 'fitness_centre', radius),
            'parks': search_osm(lat, lng, 'park', radius, use_leisure=True),
            'vets': search_osm(lat, lng, 'veterinary', radius),
            'restaurants': search_osm(lat, lng, 'restaurant', radius),
            'pharmacies': search_osm(lat, lng, 'pharmacy', radius),
            'community_centers': search_osm(lat, lng, 'community_centre', radius),
            'libraries': search_osm(lat, lng, 'library', radius)
        }
        
        return jsonify({
            'success': True,
            'amenities': amenities
        })
        
    except Exception as e:
        print(f"Error fetching amenities: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


def search_osm(lat, lng, amenity_type, radius=3000, use_leisure=False):
    """
    Search OpenStreetMap for nearby amenities
    Returns: List of {name, lat, lng, distance}
    """
    try:
        overpass_url = "http://overpass-api.de/api/interpreter"
        
        if use_leisure:
            # Parks use leisure tag instead of amenity
            query = f"""
            [out:json][timeout:25];
            (
              node["leisure"="{amenity_type}"](around:{radius},{lat},{lng});
              way["leisure"="{amenity_type}"](around:{radius},{lat},{lng});
            );
            out center;
            """
        else:
            query = f"""
            [out:json][timeout:25];
            (
              node["amenity"="{amenity_type}"](around:{radius},{lat},{lng});
              way["amenity"="{amenity_type}"](around:{radius},{lat},{lng});
            );
            out center;
            """
        
        response = requests.get(overpass_url, params={'data': query}, timeout=30)
        data = response.json()
        
        max_results = 4 if amenity_type == 'school' else 20
        results = []
        for element in data.get('elements', []):
            tags = element.get('tags', {})
            elem_lat = element.get('lat') or element.get('center', {}).get('lat')
            elem_lng = element.get('lon') or element.get('center', {}).get('lon')
            
            if elem_lat and elem_lng:
                distance = haversine_distance(lat, lng, elem_lat, elem_lng)
                entry = {
                    'name': tags.get('name', f'Unnamed {amenity_type}'),
                    'type': amenity_type,
                    'lat': elem_lat,
                    'lng': elem_lng,
                    'distance_miles': round(distance, 2),
                    'address': tags.get('addr:street', '')
                }
                # Include website for schools
                if amenity_type == 'school':
                    website = tags.get('website') or tags.get('contact:website') or ''
                    if website:
                        entry['website'] = website
                results.append(entry)
        
        # Sort by distance and limit results
        results.sort(key=lambda x: x['distance_miles'])
        return results[:max_results]
        
    except Exception as e:
        print(f"Error in OSM search for {amenity_type}: {str(e)}")
        return []


# ============================================================================
# COMMUTE CALCULATOR (Using Haversine + OSRM - FREE!)
# ============================================================================

@app.route('/api/commute', methods=['POST'])
def calculate_commute():
    """
    Calculate commute distance and time
    Body: { property_lat, property_lng, work_lat, work_lng, mode: 'driving'|'walking'|'cycling' }
    """
    try:
        data = request.json
        
        # Simple straight-line distance
        distance = haversine_distance(
            data['property_lat'], data['property_lng'],
            data['work_lat'], data['work_lng']
        )
        
        # Try to get actual route from OSRM (free routing)
        mode = data.get('mode', 'driving')
        route = get_osrm_route(
            data['property_lat'], data['property_lng'],
            data['work_lat'], data['work_lng'],
            mode
        )
        
        if route:
            result = {
                'success': True,
                'straight_line_distance_miles': round(distance, 2),
                'route_distance_miles': route['distance_miles'],
                'duration_minutes': route['duration_minutes'],
                'mode': mode
            }
            if route.get('geometry'):
                result['geometry'] = route['geometry']
            return jsonify(result)
        else:
            return jsonify({
                'success': True,
                'straight_line_distance_miles': round(distance, 2),
                'mode': mode
            })
        
    except Exception as e:
        print(f"Error calculating commute: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


def haversine_distance(lat1, lng1, lat2, lng2):
    """
    Calculate straight-line distance between two points in miles
    """
    R = 3959  # Earth's radius in miles
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c


def get_osrm_route(start_lat, start_lng, end_lat, end_lng, mode='driving'):
    """
    Get route from OSRM (free routing API)
    """
    try:
        # OSRM modes: car, foot, bicycle
        osrm_mode = {'driving': 'car', 'walking': 'foot', 'cycling': 'bicycle'}.get(mode, 'car')
        
        url = f"http://router.project-osrm.org/route/v1/{osrm_mode}/{start_lng},{start_lat};{end_lng},{end_lat}"
        params = {'overview': 'full', 'geometries': 'geojson', 'steps': 'false'}
        
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        if data.get('code') == 'Ok' and data.get('routes'):
            route = data['routes'][0]
            result = {
                'distance_miles': round(route['distance'] / 1609.34, 2),
                'duration_minutes': round(route['duration'] / 60, 1)
            }
            if route.get('geometry'):
                result['geometry'] = route['geometry']
            return result
        
        return None
        
    except Exception as e:
        print(f"OSRM error: {str(e)}")
        return None


# ============================================================================
# PROPERTY FILTERING (Post-processing for features not in API)
# ============================================================================

@app.route('/api/filter-advanced', methods=['POST'])
def filter_advanced():
    """
    Advanced filtering for features not available in HomeHarvest API
    Body: { properties: [...], filters: { has_pool, has_basement, has_garage, stories_min, stories_max } }
    """
    try:
        data = request.json
        properties = data['properties']
        filters = data.get('filters', {})
        
        df = pd.DataFrame(properties)
        filtered = df.copy()
        
        # Filter by stories
        if filters.get('stories_min'):
            filtered = filtered[filtered['stories'] >= filters['stories_min']]
        if filters.get('stories_max'):
            filtered = filtered[filtered['stories'] <= filters['stories_max']]
        
        # Filter by garage
        if filters.get('has_garage'):
            filtered = filtered[filtered['parking_garage'] > 0]
        
        # Filter by pool (search in description)
        if filters.get('has_pool'):
            filtered = filtered[filtered['text'].str.contains('pool', case=False, na=False)]
        
        # Filter by basement (search in description)
        if filters.get('has_basement'):
            filtered = filtered[filtered['text'].str.contains('basement', case=False, na=False)]
        
        return jsonify({
            'success': True,
            'count': len(filtered),
            'properties': filtered.to_dict('records')
        })
        
    except Exception as e:
        print(f"Error in advanced filtering: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================================================
# QUIZ & RECOMMENDATIONS
# ============================================================================

@app.route('/api/quiz/recommend', methods=['POST'])
def quiz_recommend():
    """
    Get neighborhood recommendations based on quiz answers
    Body: { budget, property_type, schools_important, commute_max, lifestyle }
    """
    try:
        data = request.json
        
        recommendations = []
        
        # NYC neighborhood recommendations based on quiz
        if data.get('schools_important') and data.get('budget') == 'high':
            recommendations.append({
                'neighborhood': 'Upper West Side',
                'score': 95,
                'reasons': ['Top-rated schools', 'Family-friendly', 'Central Park nearby'],
                'avg_price': 1500000,
                'coordinates': [40.7870, -73.9754]
            })
        
        if data.get('budget') == 'medium':
            recommendations.append({
                'neighborhood': 'Astoria, Queens',
                'score': 88,
                'reasons': ['Affordable', 'Good restaurants', 'Near subway'],
                'avg_price': 650000,
                'coordinates': [40.7648, -73.9241]
            })
            recommendations.append({
                'neighborhood': 'Park Slope, Brooklyn',
                'score': 90,
                'reasons': ['Family-friendly', 'Prospect Park', 'Good schools'],
                'avg_price': 850000,
                'coordinates': [40.6710, -73.9778]
            })
        
        if data.get('budget') == 'low':
            recommendations.append({
                'neighborhood': 'Inwood, Manhattan',
                'score': 82,
                'reasons': ['Affordable Manhattan', 'Parks', 'Improving area'],
                'avg_price': 450000,
                'coordinates': [40.8677, -73.9212]
            })
        
        if data.get('lifestyle') == 'urban':
            recommendations.append({
                'neighborhood': 'Williamsburg, Brooklyn',
                'score': 92,
                'reasons': ['Trendy', 'Restaurants & bars', 'Art scene'],
                'avg_price': 950000,
                'coordinates': [40.7081, -73.9571]
            })
        
        # Sort by score
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations[:5]
        })
        
    except Exception as e:
        print(f"Error in quiz recommendations: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================================================
# FAMILY PROFILE RECOMMENDATIONS (Rule-based scoring)
# ============================================================================

@app.route('/api/family-recommend', methods=['POST'])
def family_recommend():
    """
    Score properties against family requirements.
    Body: { location, budget_min, budget_max, bedrooms, bathrooms, sqft_min,
            property_type, needs_schools, needs_parks, needs_garage, needs_pool,
            needs_basement, needs_transit, children_count, lifestyle, ... }
    """
    try:
        data = request.json
        loc = (data.get('location') or '').strip() or 'New York, NY'

        def safe_int(val):
            """Convert to int safely, return None for empty/invalid values."""
            if val is None or val == '':
                return None
            try:
                return int(val)
            except (ValueError, TypeError):
                return None

        # Build search params from family profile
        search_params = {
            'location': loc,
            'listing_type': 'for_sale',
        }
        if safe_int(data.get('budget_min')):
            search_params['price_min'] = safe_int(data['budget_min'])
        if safe_int(data.get('budget_max')):
            search_params['price_max'] = safe_int(data['budget_max'])
        if safe_int(data.get('bedrooms')):
            search_params['beds_min'] = safe_int(data['bedrooms'])
        if safe_int(data.get('bathrooms')):
            search_params['baths_min'] = safe_int(data['bathrooms'])
        if safe_int(data.get('sqft_min')):
            search_params['sqft_min'] = safe_int(data['sqft_min'])

        properties = scrape_property(
            location=search_params['location'],
            listing_type='for_sale',
            price_min=search_params.get('price_min'),
            price_max=search_params.get('price_max'),
            beds_min=search_params.get('beds_min'),
            baths_min=search_params.get('baths_min'),
            sqft_min=search_params.get('sqft_min'),
            sort_by='list_price',
            sort_direction='asc',
            limit=100,
        )

        properties = properties.astype(object).where(properties.notna(), None)
        props = properties.to_dict('records')

        # Score each property
        budget_min = safe_int(data.get('budget_min'))
        budget_max = safe_int(data.get('budget_max'))
        need_beds = safe_int(data.get('bedrooms')) or 0
        need_baths = safe_int(data.get('bathrooms')) or 0
        need_sqft = safe_int(data.get('sqft_min')) or 0
        pref_type = (data.get('property_type') or '').lower().replace('_', ' ')
        has_children = (safe_int(data.get('children_count')) or 0) > 0

        scored = []
        for p in props:
            score = 0
            reasons = []
            max_score = 0

            # Price within budget (+20)
            max_score += 20
            price = p.get('list_price')
            if price:
                in_budget = True
                if budget_min and price < budget_min:
                    in_budget = False
                if budget_max and price > budget_max:
                    in_budget = False
                if in_budget:
                    score += 20
                    reasons.append('Within budget')

            # Bedrooms (+15)
            max_score += 15
            beds = p.get('beds') or 0
            if need_beds and beds >= need_beds:
                score += 15
                reasons.append(f'{beds} bedrooms')

            # Bathrooms (+10)
            max_score += 10
            baths = p.get('full_baths') or 0
            if need_baths and baths >= need_baths:
                score += 10
                reasons.append(f'{baths} bathrooms')

            # Square footage (+10)
            max_score += 10
            sqft = p.get('sqft') or 0
            if need_sqft and sqft >= need_sqft:
                score += 10
                reasons.append(f'{int(sqft):,} sqft')

            # Property type match (+10)
            max_score += 10
            if pref_type:
                style = (p.get('style') or '').lower().replace('_', ' ')
                if pref_type in style or style in pref_type:
                    score += 10
                    reasons.append('Property type match')

            # Description-based amenity checks
            desc = (p.get('text') or p.get('description') or '').lower()

            # Schools (+15 if has children & wants schools)
            if data.get('needs_schools') and has_children:
                max_score += 15
                if 'school' in desc or 'education' in desc:
                    score += 15
                    reasons.append('Near schools')

            # Parks (+5)
            if data.get('needs_parks'):
                max_score += 5
                if 'park' in desc or 'green' in desc:
                    score += 5
                    reasons.append('Near parks')

            # Garage (+5)
            if data.get('needs_garage'):
                max_score += 5
                garage = p.get('parking_garage') or 0
                if garage > 0 or 'garage' in desc:
                    score += 5
                    reasons.append('Has garage')

            # Pool (+5)
            if data.get('needs_pool'):
                max_score += 5
                if 'pool' in desc:
                    score += 5
                    reasons.append('Has pool')

            # Basement (+5)
            if data.get('needs_basement'):
                max_score += 5
                if 'basement' in desc:
                    score += 5
                    reasons.append('Has basement')

            # Transit (+5)
            if data.get('needs_transit'):
                max_score += 5
                if 'subway' in desc or 'metro' in desc or 'transit' in desc or 'train' in desc or 'bus' in desc:
                    score += 5
                    reasons.append('Near transit')

            # Year built bonus (+5 if built in last 20 years)
            max_score += 5
            year = p.get('year_built')
            if year and year >= 2006:
                score += 5
                reasons.append(f'Built {year}')

            # Normalize to percentage
            match_pct = round((score / max_score) * 100) if max_score > 0 else 0
            p['match_score'] = match_pct
            p['match_reasons'] = reasons
            scored.append(p)

        # Sort by match score descending, take top 20
        scored.sort(key=lambda x: x['match_score'], reverse=True)
        top = scored[:20]

        return jsonify({
            'success': True,
            'count': len(top),
            'total_searched': len(props),
            'recommendations': top
        })

    except Exception as e:
        print(f"Error in family recommend: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Backend is running'})


# Serve React frontend in production
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    print("🚀 Starting Real Estate Backend Server...")
    print("📍 API Endpoints:")
    print("   POST /api/search - Search properties")
    print("   POST /api/amenities - Get nearby amenities")
    print("   POST /api/commute - Calculate commute")
    print("   POST /api/filter-advanced - Advanced filtering")
    print("   POST /api/quiz/recommend - Get recommendations")
    print("\n🌐 Server running on http://localhost:5001")
    
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, port=port, host='0.0.0.0')
