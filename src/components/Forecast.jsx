import React, { useState } from 'react';

function Forecast({ data, units, formatTemp, formatSpeed, mmToInches, getWeatherIcon }) {
  const [selectedHour, setSelectedHour] = useState(null);
  if (!data) return (
    <div className="forecast">
      <h2>Today's Forecast</h2>
      <p>No forecast data available</p>
    </div>
  );

  const { forecast, location } = data;
  const day = forecast.forecastday[0].day;
  // Show all hours (1-hour intervals)
  const hourly = forecast.forecastday[0].hour;

  return (
    <div className="forecast">
      <h2>Today's Forecast for {location.name}</h2>
      <div className="forecast-hero">
        <div className="forecast-left">
          <div className="temp-line">
            <span className="temp-value">{parseInt(formatTemp(day.avgtemp_c, units?.temp))}</span>
            <span className="temp-unit">°{units?.temp || 'C'}</span>
          </div>
          <div className="condition-line">
            <img
              src={getWeatherIcon(day.condition.code, 1)}
              alt={day.condition.text}
              className="forecast-icon-large"
            />
            <span className="condition-text">{day.condition.text}</span>
          </div>
          <div className="sub-line">
            <span>High {formatTemp(day.maxtemp_c, units?.temp)}</span>
            <span className="dot">•</span>
            <span>Low {formatTemp(day.mintemp_c, units?.temp)}</span>
          </div>
        </div>

        <div className="forecast-right">
          <div className="metric">
            <span className="label">Max Wind</span>
            <span className="value">{formatSpeed(day.maxwind_kph, units)}</span>
          </div>
          <div className="metric">
            <span className="label">Total Precipitation</span>
            <span className="value">{units?.distance === 'mi' ? `${mmToInches(day.totalprecip_mm).toFixed(2)} in` : `${day.totalprecip_mm} mm`}</span>
          </div>
          <div className="metric">
            <span className="label">Average Humidity</span>
            <span className="value">{day.avghumidity}%</span>
          </div>
          <div className="metric">
            <span className="label">UV Index</span>
            <span className="value">{day.uv}</span>
          </div>
          <div className="metric">
            <span className="label">Rain Chance</span>
            <span className="value">{day.daily_chance_of_rain}%</span>
          </div>
        </div>
      </div>

      {/* Hourly Forecast Section */}
      <div className="hourly-forecast">
        <h3>Hourly Forecast</h3>
        <div className="hourly-list">
          {hourly.map((hour) => (
            <div key={hour.time_epoch} className="hour-item" onClick={() => setSelectedHour(hour)}>
              <span className="hour-time">{new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <img src={getWeatherIcon(hour.condition.code, hour.is_day)} alt={hour.condition.text} className="hour-icon" />
              <span className="hour-temp">{formatTemp(hour.temp_c, units?.temp)}</span>
              <span className="hour-cond">{hour.condition.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Hour Modal */}
      {selectedHour && (
        <div className="hour-modal-overlay" onClick={() => setSelectedHour(null)}>
          <div className="hour-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hour-modal-header">
              <h3>{new Date(selectedHour.time).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}</h3>
              <button className="close-btn" onClick={() => setSelectedHour(null)}>×</button>
            </div>
            <div className="hour-modal-content">
              <div className="hour-modal-main">
                <div className="hour-modal-temp">
                  <span className="temp-value">{parseInt(formatTemp(selectedHour.temp_c, units?.temp))}</span>
                  <span className="temp-unit">°{units?.temp || 'C'}</span>
                </div>
                <div className="hour-modal-condition">
                  <img
                    src={getWeatherIcon(selectedHour.condition.code, selectedHour.is_day)}
                    alt={selectedHour.condition.text}
                    className="hour-modal-icon"
                  />
                  <span className="condition-text">{selectedHour.condition.text}</span>
                </div>
              </div>
              
              <div className="hour-modal-details">
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Feels Like</span>
                    <span className="detail-value">{formatTemp(selectedHour.feelslike_c, units?.temp)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Wind</span>
                    <span className="detail-value">{formatSpeed(selectedHour.wind_kph, units)} {selectedHour.wind_degree}° {selectedHour.wind_dir}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Wind Gust</span>
                    <span className="detail-value">{formatSpeed(selectedHour.gust_kph, units)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Precipitation</span>
                    <span className="detail-value">{units?.distance === 'mi' ? `${mmToInches(selectedHour.precip_mm).toFixed(2)} in` : `${selectedHour.precip_mm} mm`}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Humidity</span>
                    <span className="detail-value">{selectedHour.humidity}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Cloud Cover</span>
                    <span className="detail-value">{selectedHour.cloud}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Heat Index</span>
                    <span className="detail-value">{formatTemp(selectedHour.heatindex_c, units?.temp)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">UV Index</span>
                    <span className="detail-value">{selectedHour.uv}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Forecast;