import React, { useEffect, useState } from 'react';

function Marine({ data }) {
  if (!data) return (
    <div className="marine">
      <h2>Marine Conditions</h2>
      <p>No marine data available</p>
    </div>
  );

  const { forecast, location } = data;
  const tides = forecast.forecastday[0].day.tides[0].tide;

  return (
    <div className="marine">
      <h2>Marine Conditions for {location.name}</h2>
      <div className="tides-info">
        <h3>Tides</h3>
        <div className="tides-grid">
          {tides.map((tide, index) => (
            <div key={index} className="tide-item">
              <div className="tide-time">
                <span className="label">Time:</span>
                <span>{new Date(tide.tide_time).toLocaleTimeString()}</span>
              </div>
              <div className="tide-height">
                <span className="label">Height:</span>
                <span>{tide.tide_height_mt} m</span>
              </div>
              <div className="tide-type">
                <span className={`tide-badge ${tide.tide_type.toLowerCase()}`}>
                  {tide.tide_type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export default Marine;