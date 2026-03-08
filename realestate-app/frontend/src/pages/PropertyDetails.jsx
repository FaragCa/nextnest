import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Footer from '../components/Footer';
import { getAmenities, calculateCommute } from '../services/api';
import 'leaflet/dist/leaflet.css';
import './PropertyDetails.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const AMENITY_ICONS = {
  schools: 'Schools', hospitals: 'Hospitals', gyms: 'Gyms', parks: 'Parks',
  restaurants: 'Restaurants', pharmacies: 'Pharmacies', libraries: 'Libraries', community_centers: 'Community', vets: 'Vets',
};

export default function PropertyDetails() {
  const { id } = useParams();
  const loc = useLocation();
  const property = loc.state?.property;

  const [amenities, setAmenities] = useState(null);
  const [commuteResult, setCommuteResult] = useState(null);
  const [commuteMode, setCommuteMode] = useState('driving');
  const [workAddress, setWorkAddress] = useState('');
  const [commuteLoading, setCommuteLoading] = useState(false);
  const [amenitiesLoading, setAmenitiesLoading] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [formData, setFormData] = useState({ name: '', email: '', date: '' });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleBookViewing = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.date) return;
    setShowConfirmation(true);
    setFormData({ name: '', email: '', date: '' });
  };

  useEffect(() => {
    if (property?.latitude && property?.longitude) {
      fetchAmenities();
    }
  }, [property]);

  const fetchAmenities = async () => {
    setAmenitiesLoading(true);
    try {
      const res = await getAmenities({
        latitude: property.latitude,
        longitude: property.longitude,
        radius: 3000,
      });
      if (res.data.success) setAmenities(res.data.amenities);
    } catch (err) {
      console.error('Amenities fetch failed:', err);
    } finally {
      setAmenitiesLoading(false);
    }
  };

  const handleCommuteCalc = async () => {
    if (!workAddress.trim() || !property?.latitude) return;
    setCommuteLoading(true);
    try {
      // Geocode work address using OpenStreetMap Nominatim
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(workAddress)}&limit=1`
      );
      const geoData = await geoRes.json();
      if (geoData.length === 0) { setCommuteLoading(false); return; }

      const workLat = parseFloat(geoData[0].lat);
      const workLng = parseFloat(geoData[0].lon);

      const results = {};
      for (const mode of ['driving', 'walking', 'cycling']) {
        const res = await calculateCommute({
          property_lat: property.latitude,
          property_lng: property.longitude,
          work_lat: workLat,
          work_lng: workLng,
          mode,
        });
        if (res.data.success) {
          results[mode] = {
            distance: res.data.route_distance_miles || res.data.straight_line_distance_miles,
            duration: res.data.duration_minutes || Math.round((res.data.straight_line_distance_miles || 0) * 4),
          };
        }
      }
      setCommuteResult(results);
    } catch (err) {
      console.error('Commute calculation failed:', err);
    } finally {
      setCommuteLoading(false);
    }
  };

  if (!property) {
    return (
      <div className="pd-empty">
        <h2>Property Not Found</h2>
        <p>Please navigate from the search results page.</p>
      </div>
    );
  }

  const photos = [];
  if (property.primary_photo) photos.push(property.primary_photo);
  if (property.alt_photos) {
    const alts = typeof property.alt_photos === 'string'
      ? property.alt_photos.split(',').map(s => s.trim()).filter(Boolean)
      : Array.isArray(property.alt_photos) ? property.alt_photos : [];
    photos.push(...alts.slice(0, 5));
  }

  const formatPrice = (p) => {
    if (!p) return 'N/A';
    return p >= 1000000 ? `$${(p / 1000000).toFixed(1)}M` : `$${p.toLocaleString()}`;
  };

  const allAmenityMarkers = amenities
    ? Object.entries(amenities).flatMap(([type, items]) =>
        items.filter(a => a.lat && a.lng).map(a => ({ ...a, category: type }))
      )
    : [];

  return (
    <div className="pd">
      <div className="pd__main">
        {/* Left Column */}
        <div className="pd__left">
          {/* Image Gallery */}
          <section className="pd__gallery">
            <div className="pd__gallery-main">
              {photos[activeImg] ? (
                <img src={photos[activeImg]} alt="Property" />
              ) : (
                <div className="pd__gallery-placeholder">No Photo Available</div>
              )}
              {photos.length > 1 && (
                <>
                  <button className="pd__gallery-arrow pd__gallery-arrow--left" onClick={() => setActiveImg(i => i === 0 ? photos.length - 1 : i - 1)}>
                    <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
                  </button>
                  <button className="pd__gallery-arrow pd__gallery-arrow--right" onClick={() => setActiveImg(i => i === photos.length - 1 ? 0 : i + 1)}>
                    <svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18" /></svg>
                  </button>
                </>
              )}
            </div>
            {photos.length > 1 && (
              <>
                <div className="pd__gallery-dots">
                  {photos.map((_, i) => (
                    <button key={i} className={`pd__gallery-dot ${i === activeImg ? 'active' : ''}`} onClick={() => setActiveImg(i)} />
                  ))}
                </div>
                <div className="pd__gallery-thumbs">
                  {photos.slice(0, 5).map((p, i) => (
                    <button
                      key={i}
                      className={`pd__thumb ${i === activeImg ? 'active' : ''}`}
                      onClick={() => setActiveImg(i)}
                    >
                      <img src={p} alt={`Thumbnail ${i + 1}`} />
                      {i === 4 && photos.length > 5 && (
                        <span className="pd__thumb-more">+{photos.length - 5} photos</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Property Header */}
          <section className="pd__header">
            <div className="pd__header-left">
              <div className="pd__verified">Verified Listing</div>
              <h1 className="pd__title">{property.full_street_line || property.street || 'Unnamed Property'}</h1>
              <p className="pd__address">
                {property.city || ''}{property.city && property.state ? ', ' : ''}{property.state || ''} {property.zip_code || ''}
              </p>
            </div>
            <div className="pd__header-right">
              <p className="pd__price">{formatPrice(property.list_price)}</p>
              <div className="pd__actions">
                <button className="btn btn--outline btn--sm">Save</button>
                <button className="btn btn--outline btn--sm">Share</button>
              </div>
            </div>
          </section>

          {/* Specs */}
          <section className="pd__specs">
            {property.beds != null && (
              <div className="pd__spec">
                <div><small>Bedrooms</small><strong>{property.beds} Beds</strong></div>
              </div>
            )}
            {property.full_baths != null && (
              <div className="pd__spec">
                <div><small>Bathrooms</small><strong>{property.full_baths} Bath</strong></div>
              </div>
            )}
            {property.sqft != null && (
              <div className="pd__spec">
                <div><small>Total Area</small><strong>{property.sqft.toLocaleString()} sqft</strong></div>
              </div>
            )}
            {property.year_built && (
              <div className="pd__spec">
                <div><small>Year Built</small><strong>{property.year_built}</strong></div>
              </div>
            )}
          </section>

          {/* About */}
          {property.text && (
            <section className="pd__about">
              <h2>About this property</h2>
              {property.text
                .split(/\n\s*\n/)
                .flatMap(block => {
                  const trimmed = block.trim();
                  if (!trimmed) return [];
                  // If block is very long (>400 chars), split on sentence boundaries every ~2-3 sentences
                  if (trimmed.length > 400) {
                    const sentences = trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed];
                    const chunks = [];
                    let current = '';
                    sentences.forEach(s => {
                      current += s;
                      if (current.length > 300) {
                        chunks.push(current.trim());
                        current = '';
                      }
                    });
                    if (current.trim()) chunks.push(current.trim());
                    return chunks;
                  }
                  return [trimmed];
                })
                .map((para, i) => <p key={i}>{para}</p>)
              }
            </section>
          )}

          {/* Commute Calculator */}
          <section className="pd__commute">
            <div className="pd__commute-header">
              <h2>Commute Calculator</h2>
              <p>See how far your workplace is from home</p>
            </div>
            <div className="pd__commute-input">
              <input
                type="text"
                placeholder="Enter work address..."
                value={workAddress}
                onChange={e => setWorkAddress(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCommuteCalc()}
              />
              <button className="btn btn--blue btn--sm" onClick={handleCommuteCalc} disabled={commuteLoading}>
                {commuteLoading ? '...' : 'Calculate'}
              </button>
            </div>
            {commuteResult && (
              <div className="pd__commute-results">
                {['driving', 'cycling', 'walking'].map(mode => (
                  <button
                    key={mode}
                    className={`pd__commute-mode ${commuteMode === mode ? 'active' : ''}`}
                    onClick={() => setCommuteMode(mode)}
                  >
                    <span className="pd__commute-mode-icon">
                      {mode === 'driving' ? 'Drive' : mode === 'cycling' ? 'Bike' : 'Walk'}
                    </span>
                    <span className="pd__commute-mode-time">
                      {commuteResult[mode]?.duration ? `${Math.round(commuteResult[mode].duration)} min` : 'N/A'}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {property.latitude && (
              <div className="pd__commute-map">
                <MapContainer center={[property.latitude, property.longitude]} zoom={13} scrollWheelZoom={false} style={{ height: '200px', width: '100%', borderRadius: '16px' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[property.latitude, property.longitude]}>
                    <Popup>Property</Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}
          </section>

          {/* Amenities */}
          <section className="pd__amenities">
            <h2>Amenities</h2>
            {amenitiesLoading ? (
              <p className="pd__loading-text">Loading amenities...</p>
            ) : amenities ? (
              <div className="pd__amenity-tags">
                {Object.entries(amenities).map(([type, items]) =>
                  items.length > 0 ? (
                    <span key={type} className="amenity-tag">
                      {AMENITY_ICONS[type] || type} ({items.length})
                    </span>
                  ) : null
                )}
              </div>
            ) : (
              <p className="pd__loading-text">No amenity data available.</p>
            )}
          </section>

          {/* Schools Nearby */}
          {amenities?.schools?.length > 0 && (
            <section className="pd__schools">
              <h2>Schools Nearby</h2>
              <div className="pd__school-list">
                {amenities.schools.map((school, i) => {
                  const cat = (school.category || '').toLowerCase();
                  const badgeClass = cat.includes('middle') ? 'pd__school-badge pd__school-badge--middle'
                    : cat.includes('high') || cat.includes('secondary') ? 'pd__school-badge pd__school-badge--high'
                    : 'pd__school-badge';
                  return (
                    <div key={i} className="pd__school-row">
                      <div className="pd__school-info">
                        <span className="pd__school-name">{school.name}</span>
                        <div className="pd__school-meta">
                          {school.category && <span className={badgeClass}>{school.category}</span>}
                          <span className="pd__school-distance">{school.distance_miles} mi</span>
                        </div>
                        {school.address && <span className="pd__school-address">{school.address}</span>}
                      </div>
                      <div className="pd__school-links">
                        {school.ratings_url ? (
                          <a href={school.ratings_url} target="_blank" rel="noopener noreferrer" className="pd__school-link">
                            View Ratings
                          </a>
                        ) : school.website ? (
                          <a href={school.website} target="_blank" rel="noopener noreferrer" className="pd__school-link">
                            Website
                          </a>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Neighborhood Insights */}
          <section className="pd__neighborhood">
            <h2>Neighborhood Insights</h2>
            <div className="pd__neighborhood-grid">
              <div className="pd__insight">
                <div className="pd__walk-score">
                  <span className="score-number">{property.latitude ? '7.8' : 'N/A'}</span>
                  <span className="score-label">Walk Score</span>
                </div>
              </div>
              <div className="pd__insight-bars">
                <div className="insight-row">
                  <span>Safety & Security</span>
                  <div className="insight-bar"><div className="insight-bar__fill" style={{ width: '80%' }} /></div>
                  <span className="insight-label good">High</span>
                </div>
                <div className="insight-row">
                  <span>Noise Levels</span>
                  <div className="insight-bar"><div className="insight-bar__fill insight-bar__fill--warn" style={{ width: '50%' }} /></div>
                  <span className="insight-label moderate">Moderate</span>
                </div>
                <div className="insight-row">
                  <span>Public Transport</span>
                  <div className="insight-bar"><div className="insight-bar__fill" style={{ width: '90%' }} /></div>
                  <span className="insight-label good">Excellent</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <aside className="pd__sidebar">
          <div className="pd__sidebar-card">
            <h3>Schedule a Viewing</h3>
            <div className="pd__form-field">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="pd__form-field">
              <label>Email Address</label>
              <input type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="pd__form-field">
              <label>Preferred Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <button className="btn btn--blue pd__form-btn" onClick={handleBookViewing}>Book a Viewing</button>
            <p className="pd__form-legal">By clicking you agree to our Terms of Service.</p>
          </div>

          {property.city && (
            <div className="pd__why-card">
              <h3>Why {property.city}?</h3>
              <p>Experience the vibrant culture, diverse dining, and excellent transit connections that make {property.city} one of New York's most desirable neighborhoods.</p>
            </div>
          )}
        </aside>
      </div>

      {showConfirmation && (
        <div className="pd__overlay" onClick={() => setShowConfirmation(false)}>
          <div className="pd__overlay-card" onClick={e => e.stopPropagation()}>
            <div className="pd__overlay-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="var(--blue)" />
                <path d="M15 24l6 6 12-12" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3>We've received your request!</h3>
            <p>You'll receive a booking confirmation and viewing invite in your email shortly.</p>
            <button className="btn btn--blue" onClick={() => setShowConfirmation(false)}>Got it</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
