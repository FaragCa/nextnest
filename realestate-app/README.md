# Real Estate Platform - FREE Implementation 🏠

A comprehensive real estate search platform built with **100% FREE APIs**:
- ✅ No Google Maps API needed (using Leaflet + OpenStreetMap)
- ✅ No Google Places API needed (using OpenStreetMap Overpass)
- ✅ No paid routing API needed (using OSRM)
- ✅ Property data via HomeHarvest

## Features

### Core Features
- 🔍 Property search by location, address, or zip code
- 🗺️ Interactive map view with property markers
- 📊 List view with detailed property cards
- 🎯 Advanced filtering (price, beds, baths, sqft, pool, garage, basement)
- 💾 Save properties & compare side-by-side
- 👨‍👩‍👧‍👦 Family member profiles with personalized amenity search
- 🎓 School ratings and nearby schools
- 🏃 Nearby amenities (gyms, parks, hospitals, restaurants, etc.)
- 🚗 Commute calculator
- 📝 Location recommendation quiz

### Tech Stack

**Backend:**
- Python Flask
- HomeHarvest (property data)
- OpenStreetMap Overpass API (amenities)
- OSRM (routing)
- pandas (data processing)

**Frontend:**
- React.js
- Leaflet.js + OpenStreetMap (maps)
- Tailwind CSS (styling)
- Axios (API calls)

## Quick Start

### Backend Setup

1. **Navigate to backend folder:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Run the server:**
```bash
python app.py
```

Server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend folder:**
```bash
cd frontend
```

2. **Initialize React app:**
```bash
npx create-react-app .
```

3. **Install additional dependencies:**
```bash
npm install leaflet react-leaflet axios react-router-dom
```

4. **Start development server:**
```bash
npm start
```

Frontend will open on `http://localhost:3000`

## API Endpoints

### 1. Search Properties
```bash
POST /api/search
```

**Request:**
```json
{
  "location": "New York, NY",
  "listing_type": "for_sale",
  "price_min": 300000,
  "price_max": 1000000,
  "beds_min": 2,
  "beds_max": 4,
  "baths_min": 1.0,
  "sqft_min": 800
}
```

**Response:**
```json
{
  "success": true,
  "count": 1157,
  "properties": [
    {
      "property_url": "https://www.realtor.com/...",
      "formatted_address": "123 Main St, New York, NY",
      "list_price": 850000,
      "beds": 3,
      "full_baths": 2,
      "sqft": 1500,
      "latitude": 40.7128,
      "longitude": -74.0060,
      "primary_photo": "https://...",
      ...
    }
  ]
}
```

### 2. Get Nearby Amenities
```bash
POST /api/amenities
```

**Request:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radius": 3000
}
```

**Response:**
```json
{
  "success": true,
  "amenities": {
    "schools": [
      {
        "name": "PS 123",
        "lat": 40.7130,
        "lng": -74.0055,
        "distance_miles": 0.12
      }
    ],
    "gyms": [...],
    "parks": [...],
    "hospitals": [...]
  }
}
```

### 3. Calculate Commute
```bash
POST /api/commute
```

**Request:**
```json
{
  "property_lat": 40.7128,
  "property_lng": -74.0060,
  "work_lat": 40.7580,
  "work_lng": -73.9855,
  "mode": "driving"
}
```

**Response:**
```json
{
  "success": true,
  "straight_line_distance_miles": 3.5,
  "route_distance_miles": 4.2,
  "duration_minutes": 18,
  "mode": "driving"
}
```

### 4. Advanced Filtering
```bash
POST /api/filter-advanced
```

**Request:**
```json
{
  "properties": [...],
  "filters": {
    "has_pool": true,
    "has_basement": true,
    "has_garage": true,
    "stories_min": 1,
    "stories_max": 2
  }
}
```

### 5. Quiz Recommendations
```bash
POST /api/quiz/recommend
```

**Request:**
```json
{
  "budget": "medium",
  "property_type": "condo",
  "schools_important": true,
  "commute_max": 30,
  "lifestyle": "family"
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "neighborhood": "Park Slope, Brooklyn",
      "score": 90,
      "reasons": ["Family-friendly", "Prospect Park", "Good schools"],
      "avg_price": 850000,
      "coordinates": [40.6710, -73.9778]
    }
  ]
}
```

## Testing the APIs

### Using curl:

**Search Properties:**
```bash
curl -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Brooklyn, NY",
    "listing_type": "for_sale",
    "price_min": 500000,
    "price_max": 900000,
    "beds_min": 2
  }'
```

**Get Amenities:**
```bash
curl -X POST http://localhost:5000/api/amenities \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "radius": 3000
  }'
```

### Using Python:

```python
import requests

# Search properties
response = requests.post('http://localhost:5000/api/search', json={
    'location': 'Manhattan, NY',
    'listing_type': 'for_sale',
    'price_min': 800000,
    'beds_min': 2
})

properties = response.json()['properties']
print(f"Found {len(properties)} properties")

# Get amenities for first property
if properties:
    prop = properties[0]
    amenities_response = requests.post('http://localhost:5000/api/amenities', json={
        'latitude': prop['latitude'],
        'longitude': prop['longitude']
    })
    
    amenities = amenities_response.json()['amenities']
    print(f"Nearby schools: {len(amenities['schools'])}")
```

## Frontend Implementation

### Basic React Component Example:

**PropertyMap.jsx** (using Leaflet - FREE):
```jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export function PropertyMap({ properties }) {
  return (
    <MapContainer 
      center={[40.7128, -74.0060]} 
      zoom={12} 
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      {properties.map((property, idx) => (
        <Marker 
          key={idx}
          position={[property.latitude, property.longitude]}
        >
          <Popup>
            <div className="w-48">
              <img src={property.primary_photo} alt="" className="w-full h-32 object-cover"/>
              <h3 className="font-bold text-sm mt-2">{property.formatted_address}</h3>
              <p className="text-green-600 font-bold">${property.list_price.toLocaleString()}</p>
              <p className="text-xs">{property.beds} beds • {property.full_baths} baths</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

**SearchForm.jsx:**
```jsx
import { useState } from 'react';
import axios from 'axios';

export function SearchForm({ onResults }) {
  const [location, setLocation] = useState('New York, NY');
  const [filters, setFilters] = useState({
    listing_type: 'for_sale',
    price_min: '',
    price_max: '',
    beds_min: ''
  });

  const handleSearch = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/search', {
        location,
        ...filters
      });
      
      onResults(response.data.properties);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Enter location..."
        className="w-full p-2 border rounded mb-4"
      />
      
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Min Price"
          onChange={(e) => setFilters({...filters, price_min: e.target.value})}
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Max Price"
          onChange={(e) => setFilters({...filters, price_max: e.target.value})}
          className="p-2 border rounded"
        />
      </div>
      
      <button
        onClick={handleSearch}
        className="w-full mt-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Search Properties
      </button>
    </div>
  );
}
```

## Project Structure

```
realestate-app/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # This file
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── PropertyMap.jsx
    │   │   ├── SearchForm.jsx
    │   │   ├── PropertyCard.jsx
    │   │   ├── FilterSidebar.jsx
    │   │   └── AmenitiesView.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── SearchResults.jsx
    │   │   ├── PropertyDetail.jsx
    │   │   └── Quiz.jsx
    │   └── App.jsx
    └── package.json
```

## Free APIs Used

| Feature | API | Cost |
|---------|-----|------|
| Maps | Leaflet + OpenStreetMap | FREE |
| Property Data | HomeHarvest | FREE |
| Amenities | OpenStreetMap Overpass | FREE |
| Routing | OSRM | FREE |
| Geocoding | Nominatim (OSM) | FREE |

## Development Tips

1. **OpenStreetMap Rate Limits**: 
   - Overpass API: ~2 requests/second
   - Add delays between requests if needed

2. **OSRM Routing**:
   - Public server has rate limits
   - For production, consider self-hosting OSRM

3. **Caching**:
   - Cache amenity searches to reduce API calls
   - Use Redis or simple in-memory cache

4. **Error Handling**:
   - All endpoints return `{success: true/false, ...}`
   - Handle timeouts gracefully

## Next Steps

1. ✅ Backend is ready - test with curl or Python
2. Build React frontend with Figma designs
3. Add user authentication (Flask-Login)
4. Add database (PostgreSQL) for saved properties
5. Implement save & compare features
6. Deploy (Heroku/Railway for backend, Vercel for frontend)

## Support

All features work with **100% FREE APIs** - no credit card required!

Start the backend with `python app.py` and test the endpoints!
