import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import SearchBar from '../components/SearchBar';
import { searchProperties } from '../services/api';
import 'leaflet/dist/leaflet.css';
import './SearchResults.css';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const ITEMS_PER_PAGE = 20;

const FILTER_DEFAULTS = {
  listing_type: 'for_sale',
  price_min: '',
  price_max: '',
  beds_min: '',
  baths_min: '',
  sqft_min: '',
  sqft_max: '',
  year_built_min: '',
  property_type: '',
  has_garage: false,
  has_pool: false,
  has_basement: false,
};

const BEDS_OPTIONS = ['Any', '1+', '2+', '3+', '4+'];
const BATHS_OPTIONS = ['Any', '1+', '2+', '3+'];
const LISTING_TYPE_OPTIONS = [
  { label: 'For Sale', value: 'for_sale' },
  { label: 'For Rent', value: 'for_rent' },
];
const PROPERTY_TYPE_OPTIONS = ['Any', 'Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Land'];
const YEAR_BUILT_OPTIONS = [
  { label: 'Any', value: '' },
  { label: '2020+', value: 2020 },
  { label: '2010+', value: 2010 },
  { label: '2000+', value: 2000 },
  { label: '1990+', value: 1990 },
  { label: '1980+', value: 1980 },
  { label: 'Pre-1980', value: 1 },
];

// Sale price presets: $100K to $3M by $100K, then $5M, $10M, $20M, $30M
const SALE_PRICE_PRESETS = [
  ...Array.from({ length: 30 }, (_, i) => (i + 1) * 100000),
  5000000, 10000000, 20000000, 30000000,
];
// Rent price presets: $100 to $10K by $100, then $15K, $20K, $50K, $100K
const RENT_PRICE_PRESETS = [
  ...Array.from({ length: 100 }, (_, i) => (i + 1) * 100),
  15000, 20000, 50000, 100000,
];
const formatPresetPrice = (v) => {
  if (v >= 1000000) return `$${v / 1000000}M`;
  if (v >= 1000) return `$${v / 1000}K`;
  return `$${v}`;
};

// Sqft presets: 100 to 10,000 by 100
const SQFT_PRESETS = Array.from({ length: 100 }, (_, i) => (i + 1) * 100);

/* ── Map event handler: detects pan/zoom ── */
function MapEventHandler({ onMoveEnd }) {
  const initialRef = useRef(false);
  useMapEvents({
    moveend(e) {
      if (!initialRef.current) {
        initialRef.current = true;
        return;
      }
      const center = e.target.getCenter();
      onMoveEnd([center.lat, center.lng]);
    },
  });
  return null;
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const initialLocation = searchParams.get('location') || 'New York, NY';
  const listRef = useRef(null);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(initialLocation);
  const [filters, setFilters] = useState(FILTER_DEFAULTS);
  const [sortBy, setSortBy] = useState('list_price');
  const [openFilter, setOpenFilter] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [mapMoved, setMapMoved] = useState(false);
  const [pendingMapCenter, setPendingMapCenter] = useState(null);
  const [searchingArea, setSearchingArea] = useState(false);

  /* ── Fetch from API (server-supported filters) ── */
  const fetchProperties = useCallback(async (loc) => {
    setLoading(true);
    setCurrentPage(1);
    setMapMoved(false);
    try {
      const params = {
        location: loc || location,
        listing_type: filters.listing_type,
      };
      if (filters.price_min) params.price_min = Number(filters.price_min);
      if (filters.price_max) params.price_max = Number(filters.price_max);
      if (filters.beds_min) params.beds_min = Number(filters.beds_min);
      if (filters.baths_min) params.baths_min = Number(filters.baths_min);
      if (filters.sqft_min) params.sqft_min = Number(filters.sqft_min);
      if (filters.sqft_max) params.sqft_max = Number(filters.sqft_max);
      if (filters.year_built_min) params.year_built_min = Number(filters.year_built_min);
      params.sort_by = sortBy;
      params.sort_direction = sortBy === 'list_price' ? 'asc' : 'desc';

      const res = await searchProperties(params);
      if (res.data.success) {
        setProperties(res.data.properties || []);
      } else {
        console.error('Search error:', res.data.error);
        setProperties([]);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [location, filters, sortBy]);

  useEffect(() => { fetchProperties(initialLocation); }, [initialLocation]);

  /* ── Client-side post-filters (not supported by HomeHarvest API) ── */
  const filteredProperties = useMemo(() => {
    let result = properties;
    if (filters.property_type && filters.property_type !== 'Any') {
      const ft = filters.property_type.toLowerCase().replace('-', ' ');
      result = result.filter(p => {
        const style = (p.style || '').toLowerCase().replace('_', ' ');
        return style.includes(ft) || ft.includes(style);
      });
    }
    if (filters.has_garage) {
      result = result.filter(p => p.parking_garage && p.parking_garage > 0);
    }
    if (filters.has_pool) {
      result = result.filter(p => {
        const desc = (p.description || '').toLowerCase();
        return desc.includes('pool');
      });
    }
    if (filters.has_basement) {
      result = result.filter(p => {
        const desc = (p.description || '').toLowerCase();
        return desc.includes('basement');
      });
    }
    if (filters.baths_min) {
      const minBaths = Number(filters.baths_min);
      result = result.filter(p => {
        const total = (p.full_baths || 0) + (p.half_baths || 0);
        return total >= minBaths;
      });
    }
    return result;
  }, [properties, filters.property_type, filters.has_garage, filters.has_pool, filters.has_basement, filters.baths_min]);

  /* ── Pagination derived values ── */
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProperties = filteredProperties.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [filteredProperties.length]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('…');
      pages.push(totalPages);
    }
    return pages;
  };

  /* ── Handlers ── */
  const handleSearch = (loc) => {
    setLocation(loc);
    fetchProperties(loc);
  };

  const handleSelectOption = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setOpenFilter(null);
  };

  const applyFilters = () => fetchProperties();

  const clearFilters = () => {
    setFilters(FILTER_DEFAULTS);
    setOpenFilter(null);
  };

  const toggleCompare = (prop) => {
    setCompareList(prev =>
      prev.find(p => p.property_url === prop.property_url)
        ? prev.filter(p => p.property_url !== prop.property_url)
        : prev.length < 3 ? [...prev, prop] : prev
    );
  };

  const hasActiveFilters = filters.price_min || filters.price_max || filters.beds_min ||
    filters.baths_min || filters.sqft_min || filters.sqft_max || filters.year_built_min ||
    (filters.property_type && filters.property_type !== 'Any') ||
    filters.has_garage || filters.has_pool || filters.has_basement ||
    filters.listing_type !== 'for_sale';

  /* ── Search This Area (reverse geocode map center) ── */
  const handleSearchThisArea = useCallback(async () => {
    if (!pendingMapCenter) return;
    setSearchingArea(true);
    try {
      const [lat, lng] = pendingMapCenter;
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`
      );
      const geoData = await geoRes.json();
      const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county || '';
      const state = geoData.address?.state || '';
      const newLoc = city && state ? `${city}, ${state}` : city || state || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setLocation(newLoc);
      setMapMoved(false);
      fetchProperties(newLoc);
    } catch (err) {
      console.error('Reverse geocode failed:', err);
    } finally {
      setSearchingArea(false);
    }
  }, [pendingMapCenter, fetchProperties]);

  /* ── Map center ── */
  const mapCenter = paginatedProperties.length > 0 && paginatedProperties[0].latitude
    ? [paginatedProperties[0].latitude, paginatedProperties[0].longitude]
    : [40.7128, -74.006];

  const mappable = paginatedProperties.filter(p => p.latitude && p.longitude);

  const formatPrice = (p) => p >= 1000000
    ? `$${(p / 1000000).toFixed(1)}M`
    : `$${(p / 1000).toFixed(0)}K`;

  return (
    <div className="search-page">
      {/* Filter Bar */}
      <div className="filter-bar">
        <SearchBar variant="header" onSearch={handleSearch} />
        <div className="filter-bar__filters">
          {/* Listing Type */}
          <div className="filter-dd">
            <button className="filter-dd__trigger" onClick={() => setOpenFilter(openFilter === 'listing' ? null : 'listing')}>
              {LISTING_TYPE_OPTIONS.find(o => o.value === filters.listing_type)?.label || 'For Sale'} <span className="caret">▾</span>
            </button>
            {openFilter === 'listing' && (
              <div className="filter-dd__menu">
                {LISTING_TYPE_OPTIONS.map(o => (
                  <button key={o.value} className={filters.listing_type === o.value ? 'active' : ''} onClick={() => handleSelectOption('listing_type', o.value)}>{o.label}</button>
                ))}
              </div>
            )}
          </div>

          {/* Price (hybrid: custom input + preset dropdown) */}
          <div className="filter-dd">
            <button className="filter-dd__trigger" onClick={() => setOpenFilter(openFilter === 'price' ? null : 'price')}>
              Price {filters.price_min || filters.price_max ? '•' : ''} <span className="caret">▾</span>
            </button>
            {openFilter === 'price' && (
              <div className="filter-dd__menu filter-dd__menu--hybrid">
                <div className="hybrid-row">
                  <div className="hybrid-col">
                    <label className="filter-input-label">Min Price</label>
                    <input
                      type="number"
                      className="filter-input"
                      placeholder="$0"
                      value={filters.price_min}
                      onChange={e => setFilters(f => ({ ...f, price_min: e.target.value }))}
                    />
                    <div className="preset-list">
                      {(filters.listing_type === 'for_rent' ? RENT_PRICE_PRESETS : SALE_PRICE_PRESETS).map(v => (
                        <button key={`pmin${v}`} className={Number(filters.price_min) === v ? 'active' : ''} onClick={() => setFilters(f => ({ ...f, price_min: v }))}>{formatPresetPrice(v)}</button>
                      ))}
                    </div>
                  </div>
                  <div className="hybrid-col">
                    <label className="filter-input-label">Max Price</label>
                    <input
                      type="number"
                      className="filter-input"
                      placeholder="No max"
                      value={filters.price_max}
                      onChange={e => setFilters(f => ({ ...f, price_max: e.target.value }))}
                    />
                    <div className="preset-list">
                      {(filters.listing_type === 'for_rent' ? RENT_PRICE_PRESETS : SALE_PRICE_PRESETS).map(v => (
                        <button key={`pmax${v}`} className={Number(filters.price_max) === v ? 'active' : ''} onClick={() => setFilters(f => ({ ...f, price_max: v }))}>{formatPresetPrice(v)}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Beds */}
          <div className="filter-dd">
            <button className="filter-dd__trigger" onClick={() => setOpenFilter(openFilter === 'beds' ? null : 'beds')}>
              Beds {filters.beds_min ? '•' : ''} <span className="caret">▾</span>
            </button>
            {openFilter === 'beds' && (
              <div className="filter-dd__menu">
                {BEDS_OPTIONS.map(b => (
                  <button key={b} className={filters.beds_min === (b === 'Any' ? '' : b.replace('+', '')) ? 'active' : ''} onClick={() => handleSelectOption('beds_min', b === 'Any' ? '' : b.replace('+', ''))}>{b}</button>
                ))}
              </div>
            )}
          </div>

          {/* Baths */}
          <div className="filter-dd">
            <button className="filter-dd__trigger" onClick={() => setOpenFilter(openFilter === 'baths' ? null : 'baths')}>
              Baths {filters.baths_min ? '•' : ''} <span className="caret">▾</span>
            </button>
            {openFilter === 'baths' && (
              <div className="filter-dd__menu">
                {BATHS_OPTIONS.map(b => (
                  <button key={b} className={filters.baths_min === (b === 'Any' ? '' : b.replace('+', '')) ? 'active' : ''} onClick={() => handleSelectOption('baths_min', b === 'Any' ? '' : b.replace('+', ''))}>{b}</button>
                ))}
              </div>
            )}
          </div>

          {/* Sqft (hybrid: custom input + preset dropdown) */}
          <div className="filter-dd">
            <button className="filter-dd__trigger" onClick={() => setOpenFilter(openFilter === 'sqft' ? null : 'sqft')}>
              Sqft {filters.sqft_min || filters.sqft_max ? '•' : ''} <span className="caret">▾</span>
            </button>
            {openFilter === 'sqft' && (
              <div className="filter-dd__menu filter-dd__menu--hybrid">
                <div className="hybrid-row">
                  <div className="hybrid-col">
                    <label className="filter-input-label">Min Sqft</label>
                    <input
                      type="number"
                      className="filter-input"
                      placeholder="0"
                      value={filters.sqft_min}
                      onChange={e => setFilters(f => ({ ...f, sqft_min: e.target.value }))}
                    />
                    <div className="preset-list">
                      {SQFT_PRESETS.map(v => (
                        <button key={`smin${v}`} className={Number(filters.sqft_min) === v ? 'active' : ''} onClick={() => setFilters(f => ({ ...f, sqft_min: v }))}>{v.toLocaleString()}</button>
                      ))}
                    </div>
                  </div>
                  <div className="hybrid-col">
                    <label className="filter-input-label">Max Sqft</label>
                    <input
                      type="number"
                      className="filter-input"
                      placeholder="No max"
                      value={filters.sqft_max}
                      onChange={e => setFilters(f => ({ ...f, sqft_max: e.target.value }))}
                    />
                    <div className="preset-list">
                      {SQFT_PRESETS.map(v => (
                        <button key={`smax${v}`} className={Number(filters.sqft_max) === v ? 'active' : ''} onClick={() => setFilters(f => ({ ...f, sqft_max: v }))}>{v.toLocaleString()}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Year Built */}
          <div className="filter-dd">
            <button className="filter-dd__trigger" onClick={() => setOpenFilter(openFilter === 'year' ? null : 'year')}>
              Year {filters.year_built_min ? '•' : ''} <span className="caret">▾</span>
            </button>
            {openFilter === 'year' && (
              <div className="filter-dd__menu">
                {YEAR_BUILT_OPTIONS.map(o => (
                  <button key={o.label} className={String(filters.year_built_min) === String(o.value) ? 'active' : ''} onClick={() => handleSelectOption('year_built_min', o.value)}>{o.label}</button>
                ))}
              </div>
            )}
          </div>

          {/* Property Type */}
          <div className="filter-dd">
            <button className="filter-dd__trigger" onClick={() => setOpenFilter(openFilter === 'type' ? null : 'type')}>
              Type {filters.property_type && filters.property_type !== 'Any' ? '•' : ''} <span className="caret">▾</span>
            </button>
            {openFilter === 'type' && (
              <div className="filter-dd__menu">
                {PROPERTY_TYPE_OPTIONS.map(t => (
                  <button key={t} className={filters.property_type === t ? 'active' : ''} onClick={() => handleSelectOption('property_type', t === 'Any' ? '' : t)}>{t}</button>
                ))}
              </div>
            )}
          </div>

          {/* More Filters (Garage / Pool / Basement) */}
          <div className="filter-dd">
            <button className="filter-dd__trigger" onClick={() => setOpenFilter(openFilter === 'more' ? null : 'more')}>
              More {(filters.has_garage || filters.has_pool || filters.has_basement) ? '•' : ''} <span className="caret">▾</span>
            </button>
            {openFilter === 'more' && (
              <div className="filter-dd__menu filter-dd__menu--checks">
                <label className="filter-check">
                  <input type="checkbox" checked={filters.has_garage} onChange={e => setFilters(f => ({ ...f, has_garage: e.target.checked }))} />
                  Garage
                </label>
                <label className="filter-check">
                  <input type="checkbox" checked={filters.has_pool} onChange={e => setFilters(f => ({ ...f, has_pool: e.target.checked }))} />
                  Pool
                </label>
                <label className="filter-check">
                  <input type="checkbox" checked={filters.has_basement} onChange={e => setFilters(f => ({ ...f, has_basement: e.target.checked }))} />
                  Basement
                </label>
              </div>
            )}
          </div>

          <button className="pill pill--active" onClick={applyFilters}>Apply</button>
          {hasActiveFilters && <button className="pill pill--clear" onClick={clearFilters}>Clear All</button>}
        </div>
      </div>

      <div className="search-page__body">
        {/* Property List */}
        <div className="search-page__list" ref={listRef}>
          <div className="search-page__meta">
            <h2>Properties in {location}</h2>
            <span>{filteredProperties.length} properties found</span>
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); }} className="sort-select">
              <option value="list_price">Price: Low to High</option>
              <option value="list_date">Newest</option>
            </select>
          </div>

          {loading ? (
            <div className="search-page__loading">
              <div className="spinner" />
              <p>Searching properties...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="search-page__empty">No properties found. Try a different location or filters.</div>
          ) : (
            <>
              <div className="property-list">
                {paginatedProperties.map((prop, idx) => {
                  const globalIdx = startIdx + idx;
                  return (
                    <Link
                      key={prop.property_url || globalIdx}
                      to={`/property/${globalIdx}`}
                      state={{ property: prop }}
                      className="prop-card"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div className="prop-card__img">
                        {prop.primary_photo ? (
                          <img src={prop.primary_photo} alt={prop.full_street_line || 'Property'} loading="lazy" />
                        ) : (
                          <div className="prop-card__img-placeholder">No Photo</div>
                        )}
                        <button
                          className={`prop-card__compare ${compareList.find(p => p.property_url === prop.property_url) ? 'active' : ''}`}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(prop); }}
                          title="Add to compare"
                        >{compareList.find(p => p.property_url === prop.property_url) ? 'Compare' : 'Compare'}</button>
                      </div>
                      <div className="prop-card__body">
                        <h3 className="prop-card__title">{prop.full_street_line || prop.street || 'Unnamed Property'}</h3>
                        <p className="prop-card__price">
                          {prop.list_price ? formatPrice(prop.list_price) : 'Price N/A'}
                        </p>
                        <p className="prop-card__location">
                          {prop.city || ''}{prop.city && prop.state ? ', ' : ''}{prop.state || ''} {prop.zip_code || ''}
                        </p>
                        <div className="prop-card__specs">
                          {prop.beds != null && <span>{prop.beds} Beds</span>}
                          {prop.full_baths != null && <span>{prop.full_baths} Bath</span>}
                          {prop.sqft != null && <span>{prop.sqft.toLocaleString()} sqft</span>}
                        </div>
                        <div className="prop-card__tags">
                          {prop.hoa_fee && <span className="tag">HOA</span>}
                          {prop.parking_garage > 0 && <span className="tag">Garage</span>}
                          {prop.year_built && <span className="tag">Built {prop.year_built}</span>}
                        </div>
                        <div className="prop-card__footer">
                          <label className="compare-check" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={!!compareList.find(p => p.property_url === prop.property_url)}
                              onChange={(e) => { e.stopPropagation(); toggleCompare(prop); }}
                            />
                            Compare
                          </label>
                          {prop.days_on_mls != null && (
                            <span className="prop-card__days">
                              {prop.days_on_mls === 0 ? 'New' : `${prop.days_on_mls}d on market`}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <span className="pagination__info">
                    Showing {startIdx + 1}–{Math.min(startIdx + ITEMS_PER_PAGE, filteredProperties.length)} of {filteredProperties.length.toLocaleString()}
                  </span>
                  <div className="pagination__controls">
                    <button className="pagination__btn" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>Prev</button>
                    {getPageNumbers().map((p, i) =>
                      typeof p === 'string' ? (
                        <span key={`e${i}`} className="pagination__ellipsis">{p}</span>
                      ) : (
                        <button key={p} className={`pagination__btn ${p === currentPage ? 'pagination__btn--active' : ''}`} onClick={() => goToPage(p)}>{p}</button>
                      )
                    )}
                    <button className="pagination__btn" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Map */}
        <div className="search-page__map">
          <MapContainer center={mapCenter} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEventHandler
              onMoveEnd={(center) => {
                setPendingMapCenter(center);
                setMapMoved(true);
              }}
            />
            {mappable.map((prop, idx) => (
              <Marker key={idx} position={[prop.latitude, prop.longitude]}>
                <Popup>
                  <strong>{prop.full_street_line || 'Property'}</strong><br />
                  {prop.list_price ? formatPrice(prop.list_price) : ''}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          {mapMoved && (
            <button
              className="search-area-btn"
              onClick={handleSearchThisArea}
              disabled={searchingArea}
            >
              {searchingArea ? 'Searching...' : 'Search this area'}
            </button>
          )}
          {compareList.length > 0 && (
            <Link to="/compare" state={{ properties: compareList }} className="compare-fab">
              Compare {compareList.length} properties
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
