import React from 'react';

function Current({ data, units, formatTemp, formatSpeed }) {
  if (!data) return (
    <div className="current-weather">
      <h2>Current Weather</h2>
      <p>No weather data available</p>
    </div>
  );

  const { current, location } = data;

  return (
    <div className="current-weather">
      <h2>Current Weather in {location.name}</h2>
      <div className="weather-details">
        <div className="weather-main">
          <img 
            src={current.condition.icon} 
            alt={current.condition.text}
            className="weather-icon"
          />
          <div className="temperature">
            <h3>{formatTemp(current.temp_c, units?.temp)}</h3>
            <p>{current.condition.text}</p>
          </div>
        </div>
        <div className="weather-info-grid">
          <div className="info-item">
            <span>Feels like</span>
            <span>{formatTemp(current.feelslike_c, units?.temp)}</span>
          </div>
          <div className="info-item">
            <span>Wind</span>
            <span>{formatSpeed(current.wind_kph, units)} {current.wind_dir}</span>
          </div>
          <div className="info-item">
            <span>Humidity</span>
            <span>{current.humidity}%</span>
          </div>
          <div className="info-item">
            <span>UV Index</span>
            <span>{current.uv}</span>
          </div>
          <div className="info-item">
            <span>Cloud Cover</span>
            <span>{current.cloud}%</span>
          </div>
          <div className="info-item">
            <span>Last Updated</span>
            <span>{current.last_updated}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Current;