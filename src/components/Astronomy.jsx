import React from 'react';

function Astronomy({ data }) {
  if (!data) return (
    <div className="astronomy">
      <h2>Astronomy</h2>
      <p>No astronomy data available</p>
    </div>
  );

  const { astronomy, location } = data;
  const { astro } = astronomy;

  const isDay = astro.is_sun_up === 1 || astro.is_sun_up === true;
  const headline = isDay ? 'Daytime' : 'Nighttime';
  const iconEmoji = isDay ? '☀️' : '🌙';

  return (
    <div className="astronomy">
      <h2>Astronomy for {location.name}</h2>
      <div className="astronomy-hero">
        <div className="astronomy-left">
          <div className="condition-line">
            <span className="astro-icon-large" role="img" aria-label={headline}>{iconEmoji}</span>
            <span className="condition-text">{headline}</span>
          </div>
          <div className="sub-line">
            <span>Sunrise {astro.sunrise}</span>
            <span className="dot">•</span>
            <span>Sunset {astro.sunset}</span>
          </div>
        </div>

        <div className="astronomy-right">
          <div className="metric">
            <span className="label">Moonrise</span>
            <span className="value">{astro.moonrise}</span>
          </div>
          <div className="metric">
            <span className="label">Moonset</span>
            <span className="value">{astro.moonset}</span>
          </div>
          <div className="metric">
            <span className="label">Moon Phase</span>
            <span className="value">{astro.moon_phase}</span>
          </div>
          <div className="metric">
            <span className="label">Illumination</span>
            <span className="value">{astro.moon_illumination}%</span>
          </div>
          <div className="metric">
            <span className="label">Is Sun Up</span>
            <span className="value">{isDay ? 'Yes' : 'No'}</span>
          </div>
          <div className="metric">
            <span className="label">Is Moon Up</span>
            <span className="value">{astro.is_moon_up ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Astronomy;