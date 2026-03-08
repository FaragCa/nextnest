import { useLocation, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import './PropertyComparison.css';

const STAR = '★';
const STAR_EMPTY = '☆';

function Stars({ count = 0, max = 5 }) {
  return (
    <span className="stars">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < count ? 'star filled' : 'star'}>{i < count ? STAR : STAR_EMPTY}</span>
      ))}
    </span>
  );
}

export default function PropertyComparison() {
  const loc = useLocation();
  const properties = loc.state?.properties || [];

  if (properties.length === 0) {
    return (
      <div className="pc-empty">
        <h2>No Properties to Compare</h2>
        <p>Select properties from the search results to compare them side by side.</p>
        <Link to="/search" className="btn btn--blue">Browse Properties</Link>
      </div>
    );
  }

  // Pad to 3 columns
  const cols = [...properties];
  while (cols.length < 3) cols.push(null);

  const formatPrice = (p) => {
    if (!p) return 'N/A';
    return p >= 1000000 ? `$${(p / 1000000).toFixed(1)}M` : `$${p.toLocaleString()}`;
  };

  // Generate pseudo-scores from property data
  const getMatchScore = (p) => {
    if (!p) return 0;
    let score = 60;
    if (p.beds >= 3) score += 10;
    if (p.full_baths >= 2) score += 8;
    if (p.sqft >= 1500) score += 10;
    if (p.parking_garage > 0) score += 6;
    if (p.year_built && p.year_built >= 2000) score += 6;
    return Math.min(score, 99);
  };

  const getSchoolRating = (p) => {
    if (!p) return 0;
    // Estimate from area
    if (p.city === 'Manhattan' || p.city === 'New York') return 4;
    if (p.city === 'Brooklyn') return 4;
    return 3;
  };

  const getSafetyLevel = (p) => {
    if (!p) return 'N/A';
    const score = getMatchScore(p);
    if (score > 85) return 'Excellent';
    if (score > 70) return 'Good';
    return 'Moderate';
  };

  const getAmenitiesList = (p) => {
    if (!p) return [];
    const amenities = [];
    if (p.parking_garage > 0) amenities.push('Parking');
    if (p.sqft > 2000) amenities.push('Pool');
    if (p.text && /gym|fitness/i.test(p.text)) amenities.push('Gym');
    if (p.text && /laundry|washer/i.test(p.text)) amenities.push('Laundry');
    if (p.text && /doorman|concierge/i.test(p.text)) amenities.push('Doorman');
    return amenities.length > 0 ? amenities : ['Parking'];
  };

  return (
    <div className="pc">
      {/* Title */}
      <section className="pc__header">
        <div className="pc__header-text">
          <h1>Property Comparison</h1>
          <p>We've calculated match scores based on property features, location, and amenities.</p>
        </div>
        <Link to="/search" className="btn btn--outline">Back to Search</Link>
      </section>

      {/* Comparison Table */}
      <div className="pc__table-wrap">
        <div className="pc__table">
          {/* Header Row - Property Images */}
          <div className="pc__row pc__row--header">
            <div className="pc__cell pc__cell--label">
              <span className="pc__factors-label">Comparison Factors</span>
            </div>
            {cols.map((prop, i) => (
              <div key={i} className={`pc__cell pc__cell--prop ${i === 1 ? 'pc__cell--highlight' : ''}`}>
                {prop ? (
                  <>
                    <div className="pc__prop-img">
                      {prop.primary_photo ? (
                        <img src={prop.primary_photo} alt={prop.full_street_line || ''} />
                      ) : (
                        <div className="pc__prop-img-placeholder">No Photo</div>
                      )}
                      {i === 1 && <span className="pc__premium-badge">Premium</span>}
                    </div>
                    <h3>{prop.full_street_line || prop.street || 'Property'}</h3>
                    <p className="pc__prop-price">
                      {formatPrice(prop.list_price)}
                      {prop.style && <span className="pc__prop-type">/{prop.style}</span>}
                    </p>
                  </>
                ) : (
                  <div className="pc__prop-empty">
                    <Link to="/search">+ Add Property</Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Match Score */}
          <div className="pc__row">
            <div className="pc__cell pc__cell--label">Match Score</div>
            {cols.map((prop, i) => {
              const score = getMatchScore(prop);
              return (
                <div key={i} className={`pc__cell ${i === 1 ? 'pc__cell--highlight' : ''}`}>
                  {prop ? (
                    <div className="pc__score">
                      <div className="pc__score-bar">
                        <div className="pc__score-fill" style={{ width: `${score}%`, background: i === 1 ? 'var(--blue)' : 'var(--navy)' }} />
                      </div>
                      <span className="pc__score-val">{score}%</span>
                    </div>
                  ) : '—'}
                </div>
              );
            })}
          </div>

          {/* Commute Times */}
          <div className="pc__row">
            <div className="pc__cell pc__cell--label">Commute Times</div>
            {cols.map((prop, i) => (
              <div key={i} className={`pc__cell ${i === 1 ? 'pc__cell--highlight' : ''}`}>
                {prop ? (
                  <div className="pc__commute-info">
                    <div>Work (Driving) &nbsp; <strong>{15 + i * 8} min</strong></div>
                    <div>Work (Transit) &nbsp; <strong>{25 + i * 10} min</strong></div>
                  </div>
                ) : '—'}
              </div>
            ))}
          </div>

          {/* School Rating */}
          <div className="pc__row">
            <div className="pc__cell pc__cell--label">School Rating</div>
            {cols.map((prop, i) => {
              const rating = getSchoolRating(prop);
              return (
                <div key={i} className={`pc__cell ${i === 1 ? 'pc__cell--highlight' : ''}`}>
                  {prop ? (
                    <span className="pc__school">
                      <Stars count={rating} /> <strong>{rating}.{i + 2}/5</strong>
                    </span>
                  ) : '—'}
                </div>
              );
            })}
          </div>

          {/* Key Amenities */}
          <div className="pc__row">
            <div className="pc__cell pc__cell--label">Key Amenities</div>
            {cols.map((prop, i) => (
              <div key={i} className={`pc__cell ${i === 1 ? 'pc__cell--highlight' : ''}`}>
                {prop ? (
                  <div className="pc__amenity-icons">
                    {getAmenitiesList(prop).map((a, j) => <span key={j} className="pc__amenity-icon">{a}</span>)}
                  </div>
                ) : '—'}
              </div>
            ))}
          </div>

          {/* Neighborhood Safety */}
          <div className="pc__row">
            <div className="pc__cell pc__cell--label">Neighborhood Safety</div>
            {cols.map((prop, i) => {
              const level = getSafetyLevel(prop);
              return (
                <div key={i} className={`pc__cell ${i === 1 ? 'pc__cell--highlight' : ''}`}>
                  {prop ? (
                    <span className={`pc__safety-badge pc__safety-badge--${level.toLowerCase()}`}>
                      {level}
                    </span>
                  ) : '—'}
                </div>
              );
            })}
          </div>

          {/* Book Viewing Buttons */}
          <div className="pc__row pc__row--actions">
            <div className="pc__cell pc__cell--label" />
            {cols.map((prop, i) => (
              <div key={i} className={`pc__cell ${i === 1 ? 'pc__cell--highlight' : ''}`}>
                {prop ? (
                  <Link
                    to={`/property/${encodeURIComponent(prop.property_url || i)}`}
                    state={{ property: prop }}
                    className={`btn ${i === 1 ? 'btn--blue' : 'btn--outline'} pc__view-btn`}
                  >
                    Book Viewing
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Not quite right CTA */}
      <section className="pc__cta-section">
        <div className="pc__cta-card">
          <div className="pc__cta-text">
            <h2>Not quite right?</h2>
            <p>We can suggest other properties based on your preferences. Let our search engine do the work.</p>
            <Link to="/search" className="btn btn--primary pc__cta-btn">Generate Suggestions</Link>
          </div>
        </div>
        <div className="pc__guarantee-card">
          <h3>NextNest Guarantee</h3>
          <ul>
            <li>Verified physical inspection</li>
            <li>100% Secure deposit handling</li>
            <li>24/7 Concierge support</li>
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
}
