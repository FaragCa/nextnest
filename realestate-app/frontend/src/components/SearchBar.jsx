import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NY_LOCATIONS from '../data/nyLocations';
import './SearchBar.css';

export default function SearchBar({ variant = 'hero', onSearch }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIdx(-1);
    if (val.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const lower = val.toLowerCase();
    const matches = NY_LOCATIONS.filter(loc => loc.toLowerCase().includes(lower)).slice(0, 8);
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  };

  const submitSearch = (location) => {
    setShowSuggestions(false);
    const loc = location || query;
    if (!loc.trim()) return;
    if (onSearch) { onSearch(loc); return; }
    navigate(`/search?location=${encodeURIComponent(loc)}`);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') submitSearch();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0) {
        setQuery(suggestions[activeIdx]);
        submitSearch(suggestions[activeIdx]);
      } else {
        submitSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={wrapperRef} className={`search-bar search-bar--${variant}`}>
      <div className="search-bar__input-wrap">
        <svg className="search-bar__icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M12 12L16.5 16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Search city, neighborhood, or address in New York..."
          className="search-bar__input"
        />
        {query && (
          <button className="search-bar__clear" onClick={() => { setQuery(''); setSuggestions([]); }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>
      {showSuggestions && (
        <ul className="search-bar__suggestions">
          {suggestions.map((s, i) => (
            <li
              key={s}
              className={i === activeIdx ? 'active' : ''}
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => { setQuery(s); submitSearch(s); }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1C4.24 1 2 3.24 2 6c0 3.75 5 7 5 7s5-3.25 5-7c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="7" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
