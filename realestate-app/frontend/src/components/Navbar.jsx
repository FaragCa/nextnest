import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={`navbar ${isHome ? 'navbar--home' : ''}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <img src="/logo.png" alt="NextNest" className="navbar__logo" />
        </Link>

        <nav className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          <Link to="/search" className={pathname === '/search' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Find Home</Link>
          <Link to="/compare" className={pathname === '/compare' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Compare</Link>
          <Link to="/family-profile" className={pathname === '/family-profile' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Family Profile</Link>
          <Link to="/about" className={pathname === '/about' ? 'active' : ''} onClick={() => setMenuOpen(false)}>About Us</Link>
        </nav>

        <div className="navbar__actions">
          <button className="navbar__cta">Book a call</button>
          <div className="navbar__avatar">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M2 18c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span className={`navbar__hamburger-line ${menuOpen ? 'open' : ''}`} />
            <span className={`navbar__hamburger-line ${menuOpen ? 'open' : ''}`} />
            <span className={`navbar__hamburger-line ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
