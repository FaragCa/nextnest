import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import Footer from '../components/Footer';
import './Home.css';

const DB_TABS = ['Economy', 'Education', 'Taxes', 'Healthcare', 'Transit'];

const DB_CARDS = {
  Economy: [
    { title: 'Economic Climate', desc: "Insights into New York's thriving finance & tech hubs, average salaries, and cost of living across boroughs." },
    { title: 'Real Estate Market', desc: 'Current trends in NYC real estate, neighborhood price comparisons, and investment opportunities.' },
    { title: 'Job Market', desc: 'Major industries, employment rates, and career opportunities across the New York metro area.' },
  ],
  Education: [
    { title: 'School Districts', desc: 'Top-rated school districts across NY, including public, charter, and specialized high schools.' },
    { title: 'Universities', desc: 'World-class universities and colleges including Columbia, NYU, Cornell, and CUNY systems.' },
    { title: 'Early Education', desc: 'Pre-K and daycare options, after-school programs, and family-friendly neighborhood picks.' },
  ],
  Taxes: [
    { title: 'Property Taxes', desc: 'Property tax rates by county and borough, exemptions, and abatement programs available.' },
    { title: 'Income Tax', desc: "New York State and City income tax brackets, deductions, and filing requirements for residents." },
    { title: 'Tax Benefits', desc: 'First-time buyer incentives, STAR program, and other tax benefits for NY homeowners.' },
  ],
  Healthcare: [
    { title: 'Hospitals & Clinics', desc: 'Access to world-renowned hospitals like Mount Sinai, NYP, and community health centers.' },
    { title: 'Health Insurance', desc: 'NY State of Health marketplace options, Medicaid, and employer-sponsored plan comparisons.' },
    { title: 'Wellness', desc: 'Parks, fitness centers, mental health resources, and wellness programs across neighborhoods.' },
  ],
  Transit: [
    { title: 'Subway & Bus', desc: 'MTA subway and bus coverage, commute times, and transit accessibility by neighborhood.' },
    { title: 'Driving & Parking', desc: 'Commute routes, bridge/tunnel tolls, parking costs, and car ownership considerations.' },
    { title: 'Alt Transport', desc: 'Citi Bike stations, ferry routes, PATH train, and walkability scores by area.' },
  ],
};

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Economy');

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__content">
          <h1 className="hero__title">
            Your Next Home.<br />
            <span className="hero__title--gold">Simplified</span>
          </h1>
          <p className="hero__subtitle">
            Comprehensive guides, local experts, and real estate support to make your move to New York seamless.
          </p>
          <div className="hero__buttons">
            <button className="btn btn--white" onClick={() => navigate('/family-profile')}>
              Get Matched!
            </button>
          </div>
        </div>
        <div className="hero__search">
          <SearchBar variant="hero" />
        </div>
      </section>

      {/* Quiz CTA */}
      <section className="quiz-cta">
        <div className="quiz-cta__blur" />
        <div className="quiz-cta__text">
          <h2>What's your city match?</h2>
          <p>Not sure where to settle? Tell us about your lifestyle and we'll match you with the perfect New York neighborhood.</p>
        </div>
        <button className="btn btn--dark quiz-cta__btn" onClick={() => navigate('/family-profile')}>
          Get Matched!
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </section>

      {/* Database Section */}
      <section className="db-section">
        <div className="db-section__header">
          <div>
            <h2 className="db-section__title">Our database on New York</h2>
            <p className="db-section__sub">Everything you need to know before moving.</p>
          </div>
          <div className="db-section__tabs">
            {DB_TABS.map(tab => (
              <button
                key={tab}
                className={`pill ${activeTab === tab ? 'pill--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="db-section__cards">
          {DB_CARDS[activeTab].map(card => (
            <div key={card.title} className="info-card">
              <h3 className="info-card__title">{card.title}</h3>
              <p className="info-card__desc">{card.desc}</p>
              <span className="info-card__link">Learn more</span>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
