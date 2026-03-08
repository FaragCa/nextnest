import Footer from '../components/Footer';
import './AboutUs.css';

export default function AboutUs() {
  return (
    <div className="about">
      <div className="about__container">
        <header className="about__header">
          <h1>About NextNest NYC</h1>
          <p className="about__lead">
            A relocation-focused real estate platform designed specifically for families moving to New York City.
          </p>
        </header>

        <article className="about__body">
          <section className="about__section">
            <h2>What We Do</h2>
            <p>
              NextNest NYC helps users find homes that match their lifestyle by combining housing
              listings with important relocation factors such as commute time, school proximity,
              neighborhood characteristics, and nearby family-friendly activities.
            </p>
          </section>

          <section className="about__section">
            <h2>The Problem We Solve</h2>
            <p>
              Moving to a new city can be overwhelming, especially when trying to balance housing
              costs, school options, commute times, and neighborhood safety. NextNest NYC simplifies
              this process by bringing all of these decision-making factors into one unified platform.
              Instead of searching across multiple websites, families can explore neighborhoods,
              compare homes, evaluate nearby schools, and understand their daily commute from a
              single interface.
            </p>
          </section>

          <section className="about__section">
            <h2>Built for Families</h2>
            <p>
              The platform is designed around the real needs of relocating families. Users can search
              for homes that match their budget and space requirements, view nearby schools and
              activity centers, and explore neighborhoods that support their lifestyle. Each listing
              includes contextual information such as distance to schools, nearby parks and community
              centers, and estimated commute time to work or other key locations.
            </p>
          </section>

          <section className="about__section">
            <h2>Compare with Confidence</h2>
            <p>
              NextNest NYC supports side-by-side comparison of homes and neighborhoods. This allows
              families to understand tradeoffs between price, commute, school options, and
              neighborhood amenities before making a decision. By organizing information clearly
              and visually, the platform reduces decision overload and helps users confidently
              shortlist the homes that best match their priorities.
            </p>
          </section>

          <section className="about__section">
            <h2>Relocation Assistant</h2>
            <p>
              In addition to housing search tools, NextNest NYC includes a relocation assistant
              that guides families through the process of planning their move. The assistant helps
              users explore neighborhoods, compare listings, and understand the factors that make
              a location a good fit for their family. It also helps identify nearby schools,
              community activities, and essential services that contribute to a comfortable and
              connected lifestyle in New York City.
            </p>
          </section>

          <section className="about__section">
            <h2>Our Philosophy</h2>
            <p>
              NextNest NYC was designed with the understanding that choosing a home is not just
              about the property itself, but about the surrounding environment and how it supports
              everyday life. By combining housing data with neighborhood insights, education options,
              and community activities, the platform helps families make informed relocation decisions
              and transition smoothly into their new home in New York City.
            </p>
          </section>
        </article>
      </div>

      <Footer />
    </div>
  );
}
