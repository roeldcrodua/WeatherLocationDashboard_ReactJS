import React, { useEffect, useState } from 'react';

function Astronomy({ data }) {
  if (!data) return (
    <div className="astronomy">
      <h2>Astronomy</h2>
      <p>No astronomy data available</p>
    </div>
  );

  const { astronomy, location } = data;
  const { astro } = astronomy;

  return (
    <div className="astronomy">
      <h2>Astronomy for {location.name}</h2>
      <div className="astronomy-details">
        <div className="sun-info">
          <h3>Sun</h3>
          <div className="info-grid">
            <div className="info-item">
              <span>Sunrise</span>
              <span>{astro.sunrise}</span>
            </div>
            <div className="info-item">
              <span>Sunset</span>
              <span>{astro.sunset}</span>
            </div>
            <div className="info-item">
              <span>Is Sun Up</span>
              <span>{astro.is_sun_up ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        <div className="moon-info">
          <h3>Moon</h3>
          <div className="info-grid">
            <div className="info-item">
              <span>Moonrise</span>
              <span>{astro.moonrise}</span>
            </div>
            <div className="info-item">
              <span>Moonset</span>
              <span>{astro.moonset}</span>
            </div>
            <div className="info-item">
              <span>Moon Phase</span>
              <span>{astro.moon_phase}</span>
            </div>
            <div className="info-item">
              <span>Illumination</span>
              <span>{astro.moon_illumination}%</span>
            </div>
            <div className="info-item">
              <span>Is Moon Up</span>
              <span>{astro.is_moon_up ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Astronomy;