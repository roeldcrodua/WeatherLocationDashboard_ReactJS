import React from 'react';

function Marine({ data }) {
  if (!data) return (
    <div className="marine">
      <h2>Marine Conditions</h2>
      <p>No marine data available</p>
    </div>
  );

  const { forecast, location } = data;
  const tides = forecast?.forecastday?.[0]?.day?.tides?.[0]?.tide || [];
  const nextTide = tides[0];

  return (
    <div className="marine">
      <h2>Marine Conditions for {location.name}</h2>
      <div className="marine-hero">
        <div className="marine-left">
          <div className="condition-line">
            <span className="marine-icon-large" role="img" aria-label="waves">🌊</span>
            <span className="condition-text">Tides</span>
          </div>
          {nextTide && (
            <div className="sub-line">
              <span>Next {nextTide.tide_type} tide</span>
              <span className="dot">•</span>
              <span>{new Date(nextTide.tide_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="dot">•</span>
              <span>{nextTide.tide_height_mt} m</span>
            </div>
          )}
        </div>

        <div className="marine-right">
          {tides.map((tide, index) => (
            <div key={index} className="metric">
              <span className="label">{tide.tide_type} tide</span>
              <span className="value">
                {new Date(tide.tide_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {tide.tide_height_mt} m
              </span>
            </div>
          ))}
          {tides.length === 0 && (
            <div className="metric">
              <span className="label">Tide data</span>
              <span className="value">Unavailable</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Marine;