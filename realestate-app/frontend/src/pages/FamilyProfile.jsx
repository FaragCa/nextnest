import { useState } from 'react';
import { Link } from 'react-router-dom';
import { familyRecommend } from '../services/api';
import './FamilyProfile.css';

const LOCATION_SUGGESTIONS = [
  'New York, NY', 'Brooklyn, NY', 'Manhattan, NY', 'Queens, NY', 'Bronx, NY',
  'Staten Island, NY', 'Jersey City, NJ', 'Hoboken, NJ', 'Newark, NJ',
  'Long Island, NY', 'Westchester, NY', 'White Plains, NY', 'Yonkers, NY',
  'Stamford, CT', 'New Rochelle, NY',
];
const BUDGET_PRESETS = [
  '50000', '100000', '200000', '300000', '400000', '500000',
  '600000', '750000', '1000000', '1500000', '2000000', '3000000',
];
const SQFT_PRESETS_FP = ['500', '750', '1000', '1250', '1500', '2000', '2500', '3000', '4000', '5000'];
const FAMILY_SIZE_PRESETS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const AGES_SUGGESTIONS = ['Infant (0-1)', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17'];

const INITIAL_FORM = {
  family_size: 2,
  children_count: 0,
  children_ages: '',
  budget_min: '',
  budget_max: '',
  location: '',
  bedrooms: '2',
  bathrooms: '1',
  sqft_min: '',
  property_type: '',
  needs_schools: false,
  needs_parks: false,
  needs_garage: false,
  needs_pool: false,
  needs_basement: false,
  needs_transit: false,
  work_address: '',
  max_commute: '',
  lifestyle: '',
};

export default function FamilyProfile() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const toggle = (key) => setForm(f => ({ ...f, [key]: !f[key] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResults(null);
    try {
      const res = await familyRecommend(form);
      if (res.data.success) {
        setResults(res.data.recommendations);
      } else {
        setError(res.data.error || 'Something went wrong.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (p) =>
    p >= 1000000 ? `$${(p / 1000000).toFixed(1)}M` : `$${(p / 1000).toFixed(0)}K`;

  const formatBudgetPreset = (v) => {
    const n = Number(v);
    return n >= 1000000 ? `$${n / 1000000}M` : `$${(n / 1000).toFixed(0)}K`;
  };

  const getFilteredSuggestions = (list, value) => {
    if (!value) return list;
    const lower = value.toString().toLowerCase();
    return list.filter(item => item.toString().toLowerCase().includes(lower));
  };

  return (
    <div className="fp-page">
      <div className="fp-hero">
        <h1>Family Profile & Home Finder</h1>
        <p>Tell us about your family and requirements — we'll find the best matching homes for you.</p>
      </div>

      <form className="fp-form" onSubmit={handleSubmit}>
        {/* Family Info */}
        <section className="fp-section">
          <h2 className="fp-section__title">Family Information</h2>
          <div className="fp-grid">
            <div className="fp-field fp-field-with-presets">
              <span>Family Size</span>
              <input type="number" min="1" max="20" value={form.family_size}
                onChange={e => set('family_size', e.target.value)}
                onFocus={() => setFocusedField('family_size')}
                onBlur={() => setTimeout(() => setFocusedField(null), 200)}
              />
              {focusedField === 'family_size' && (
                <div className="fp-preset-dropdown">
                  {FAMILY_SIZE_PRESETS.map(v => (
                    <button key={v} type="button" onMouseDown={() => set('family_size', v)}>{v}</button>
                  ))}
                </div>
              )}
            </div>
            <label className="fp-field">
              <span>Number of Children</span>
              <input type="number" min="0" max="15" value={form.children_count} onChange={e => set('children_count', e.target.value)} />
            </label>
            <div className="fp-field fp-field--wide fp-field-with-presets">
              <span>Children's Ages (comma-separated)</span>
              <input type="text" placeholder="e.g. 3, 7, 12" value={form.children_ages}
                onChange={e => set('children_ages', e.target.value)}
                onFocus={() => setFocusedField('children_ages')}
                onBlur={() => setTimeout(() => setFocusedField(null), 200)}
              />
              {focusedField === 'children_ages' && (
                <div className="fp-preset-dropdown">
                  {AGES_SUGGESTIONS.map(v => (
                    <button key={v} type="button" onMouseDown={() => {
                      const current = form.children_ages.trim();
                      const age = v.startsWith('Infant') ? '0' : v;
                      set('children_ages', current ? `${current}, ${age}` : age);
                    }}>{v}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Budget */}
        <section className="fp-section">
          <h2 className="fp-section__title">Budget</h2>
          <div className="fp-grid">
            <div className="fp-field fp-field-with-presets">
              <span>Min Budget ($)</span>
              <input type="number" placeholder="100000" value={form.budget_min}
                onChange={e => set('budget_min', e.target.value)}
                onFocus={() => setFocusedField('budget_min')}
                onBlur={() => setTimeout(() => setFocusedField(null), 200)}
              />
              {focusedField === 'budget_min' && (
                <div className="fp-preset-dropdown">
                  {getFilteredSuggestions(BUDGET_PRESETS, form.budget_min).map(v => (
                    <button key={v} type="button" onMouseDown={() => set('budget_min', v)}>{formatBudgetPreset(v)}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="fp-field fp-field-with-presets">
              <span>Max Budget ($)</span>
              <input type="number" placeholder="1000000" value={form.budget_max}
                onChange={e => set('budget_max', e.target.value)}
                onFocus={() => setFocusedField('budget_max')}
                onBlur={() => setTimeout(() => setFocusedField(null), 200)}
              />
              {focusedField === 'budget_max' && (
                <div className="fp-preset-dropdown">
                  {getFilteredSuggestions(BUDGET_PRESETS, form.budget_max).map(v => (
                    <button key={v} type="button" onMouseDown={() => set('budget_max', v)}>{formatBudgetPreset(v)}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="fp-section">
          <h2 className="fp-section__title">Location <span className="fp-optional">(optional)</span></h2>
          <p className="fp-section__hint">Leave blank and we'll recommend the best areas for your profile.</p>
          <div className="fp-grid">
            <div className="fp-field fp-field--wide fp-field-with-presets">
              <span>Preferred City / Area</span>
              <input type="text" placeholder="e.g. New York, NY" value={form.location}
                onChange={e => set('location', e.target.value)}
                onFocus={() => setFocusedField('location')}
                onBlur={() => setTimeout(() => setFocusedField(null), 200)}
              />
              {focusedField === 'location' && (
                <div className="fp-preset-dropdown">
                  {getFilteredSuggestions(LOCATION_SUGGESTIONS, form.location).map(v => (
                    <button key={v} type="button" onMouseDown={() => set('location', v)}>{v}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Property Requirements */}
        <section className="fp-section">
          <h2 className="fp-section__title">Property Requirements</h2>
          <div className="fp-grid">
            <label className="fp-field">
              <span>Bedrooms</span>
              <select value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}>
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n}{n === 6 ? '+' : ''}</option>
                ))}
              </select>
            </label>
            <label className="fp-field">
              <span>Bathrooms</span>
              <select value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}>
                {[1, 2, 3, 4].map(n => (
                  <option key={n} value={n}>{n}{n === 4 ? '+' : ''}</option>
                ))}
              </select>
            </label>
            <div className="fp-field fp-field-with-presets">
              <span>Min Sqft</span>
              <input type="number" placeholder="1000" value={form.sqft_min}
                onChange={e => set('sqft_min', e.target.value)}
                onFocus={() => setFocusedField('sqft_min')}
                onBlur={() => setTimeout(() => setFocusedField(null), 200)}
              />
              {focusedField === 'sqft_min' && (
                <div className="fp-preset-dropdown">
                  {getFilteredSuggestions(SQFT_PRESETS_FP, form.sqft_min).map(v => (
                    <button key={v} type="button" onMouseDown={() => set('sqft_min', v)}>{Number(v).toLocaleString()} sqft</button>
                  ))}
                </div>
              )}
            </div>
            <label className="fp-field">
              <span>Property Type</span>
              <select value={form.property_type} onChange={e => set('property_type', e.target.value)}>
                <option value="">Any</option>
                <option value="single_family">Single Family</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="multi_family">Multi-Family</option>
              </select>
            </label>
          </div>
        </section>

        {/* Must-Have Amenities */}
        <section className="fp-section">
          <h2 className="fp-section__title">Must-Have Amenities</h2>
          <div className="fp-checks">
            {[
              ['needs_schools', 'Nearby Schools'],
              ['needs_parks', 'Parks & Recreation'],
              ['needs_garage', 'Garage'],
              ['needs_pool', 'Pool'],
              ['needs_basement', 'Basement'],
              ['needs_transit', 'Public Transit'],
            ].map(([key, label]) => (
              <label key={key} className="fp-check">
                <input type="checkbox" checked={form[key]} onChange={() => toggle(key)} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Commute */}
        <section className="fp-section">
          <h2 className="fp-section__title">Commute</h2>
          <div className="fp-grid">
            <label className="fp-field fp-field--wide">
              <span>Work Address</span>
              <input type="text" placeholder="e.g. 350 5th Ave, New York" value={form.work_address} onChange={e => set('work_address', e.target.value)} />
            </label>
            <label className="fp-field">
              <span>Max Commute (minutes)</span>
              <select value={form.max_commute} onChange={e => set('max_commute', e.target.value)}>
                <option value="">No preference</option>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
                <option value="90">90 min</option>
              </select>
            </label>
          </div>
        </section>

        {/* Lifestyle */}
        <section className="fp-section">
          <h2 className="fp-section__title">Lifestyle Preference</h2>
          <div className="fp-pills">
            {['Urban', 'Suburban', 'Rural'].map(opt => (
              <button
                type="button"
                key={opt}
                className={`fp-pill ${form.lifestyle === opt.toLowerCase() ? 'fp-pill--active' : ''}`}
                onClick={() => set('lifestyle', opt.toLowerCase())}
              >
                {opt}
              </button>
            ))}
          </div>
        </section>

        {error && <p className="fp-error">{error}</p>}

        <button type="submit" className="fp-submit" disabled={loading}>
          {loading ? 'Finding Homes...' : 'Find My Perfect Home'}
        </button>
      </form>

      {/* Results */}
      {loading && (
        <div className="fp-loading">
          <div className="spinner" />
          <p>Searching and scoring properties for your family...</p>
        </div>
      )}

      {results && (
        <div className="fp-results">
          <h2 className="fp-results__title">
            Top {results.length} Matches for Your Family
          </h2>
          {results.length === 0 ? (
            <p className="fp-results__empty">No matching properties found. Try adjusting your requirements.</p>
          ) : (
            <div className="fp-results__grid">
              {results.map((prop, idx) => (
                <Link
                  key={prop.property_url || idx}
                  to={`/property/${idx}`}
                  state={{ property: prop }}
                  className="fp-card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="fp-card__badge">{prop.match_score}% Match</div>
                  <div className="fp-card__img">
                    {prop.primary_photo ? (
                      <img src={prop.primary_photo} alt={prop.full_street_line || 'Property'} loading="lazy" />
                    ) : (
                      <div className="fp-card__img-placeholder">No Photo</div>
                    )}
                  </div>
                  <div className="fp-card__body">
                    <h3>{prop.full_street_line || prop.street || 'Unnamed Property'}</h3>
                    <p className="fp-card__price">
                      {prop.list_price ? formatPrice(prop.list_price) : 'Price N/A'}
                    </p>
                    <p className="fp-card__loc">
                      {prop.city || ''}{prop.city && prop.state ? ', ' : ''}{prop.state || ''} {prop.zip_code || ''}
                    </p>
                    <div className="fp-card__specs">
                      {prop.beds != null && <span>{prop.beds} Beds</span>}
                      {prop.full_baths != null && <span>{prop.full_baths} Bath</span>}
                      {prop.sqft != null && <span>{prop.sqft.toLocaleString()} sqft</span>}
                    </div>
                    {prop.match_reasons && prop.match_reasons.length > 0 && (
                      <div className="fp-card__reasons">
                        {prop.match_reasons.map((r, i) => (
                          <span key={i} className="fp-card__reason">{r}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
