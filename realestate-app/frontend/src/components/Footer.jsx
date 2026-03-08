import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand-col">
            <Link to="/" className="footer__brand">
              <img src="/logo.png" alt="NextNest" className="footer__logo" />
            </Link>
            <p className="footer__tagline">
              Your trusted partner for a smooth transition to New York living. From apartments to houses, we cover it all.
            </p>
          </div>

          <div className="footer__links-col">
            <h4>Services</h4>
            <Link to="/search">Property Search</Link>
            <Link to="/compare">Compare</Link>
            <Link to="/">Neighborhood Guide</Link>
            <Link to="/">School Districts</Link>
          </div>

          <div className="footer__links-col">
            <h4>Information</h4>
            <Link to="/">Manhattan Guide</Link>
            <Link to="/">Brooklyn Guide</Link>
            <Link to="/">Queens Guide</Link>
            <Link to="/">Tax FAQ</Link>
          </div>

          <div className="footer__links-col">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/">Careers</Link>
            <Link to="/">Privacy Policy</Link>
            <Link to="/">Contact</Link>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} NextNest Real Estate. All rights reserved.</p>
          <div className="footer__bottom-links">
            <Link to="/">Terms of Service</Link>
            <Link to="/">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
