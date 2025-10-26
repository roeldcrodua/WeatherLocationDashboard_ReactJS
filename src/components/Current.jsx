import React from 'react';

function Current({ data, units, formatTemp, formatSpeed, formatDistance, getWeatherIcon }) {
  if (!data) return (
    <div className="current-weather">
      <h2>Current Weather</h2>
      <p>No weather data available</p>
    </div>
  );

  const { current, location } = data;

  // Build pieces for display
  const tempDisplay = formatTemp(current.temp_c, units?.temp);
  const feelsLikeDisplay = formatTemp(current.feelslike_c, units?.temp);
  const windDisplay = `${formatSpeed(current.wind_kph, units)} ${current.wind_dir}`;
  const visibilityDisplay = formatDistance
    ? formatDistance(units?.distance === 'mi' ? current.vis_miles : current.vis_km, units)
    : `${units?.distance === 'mi' ? current.vis_miles : current.vis_km} ${units?.distance === 'mi' ? 'mi' : 'km'}`;
  const pressureDisplay = `${Math.round(current.pressure_mb)} mb`;
  const precipDisplay = `${Math.round(current.precip_mm)} mm`;

  return (
    <div className="current-weather">
      <h2>Current Weather</h2>
      <div className="current-hero">
        <div className="current-left">
          <div className="temp-line">
            <span className="temp-value">{parseInt(tempDisplay)}</span>
            <span className="temp-unit">°{units?.temp || 'C'}</span>
          </div>
          <div className="condition-line">
            <img
              src={getWeatherIcon(current.condition.code, current.is_day)}
              alt={current.condition.text}
              className="current-icon-large"
            />
            <span className="condition-text">{current.condition.text}</span>
          </div>
          <div className="sub-line">
            <span className="location-name">{location.name}{location.region ? `, ${location.region}` : ''}</span>
            <span className="dot">•</span>
            <span className="updated">Updated {current.last_updated}</span>
          </div>
        </div>

        <div className="current-right">
          <div className="metric">
            <span className="label">Feels like</span>
            <span className="value">{feelsLikeDisplay}</span>
          </div>
          <div className="metric">
            <span className="label">Wind</span>
            <span className="value">{windDisplay}</span>
          </div>
          <div className="metric">
            <span className="label">Humidity</span>
            <span className="value">{current.humidity}%</span>
          </div>
          <div className="metric">
            <span className="label">UV Index</span>
            <span className="value">{current.uv}</span>
          </div>
          <div className="metric">
            <span className="label">Visibility</span>
            <span className="value">{visibilityDisplay}</span>
          </div>
          <div className="metric">
            <span className="label">Pressure</span>
            <span className="value">{pressureDisplay}</span>
          </div>
          <div className="metric">
            <span className="label">Precipitation</span>
            <span className="value">{precipDisplay}</span>
          </div>
          <div className="metric">
            <span className="label">Cloud Cover</span>
            <span className="value">{current.cloud}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Current;