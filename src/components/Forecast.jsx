import React from 'react';

function Forecast({ data, units, formatTemp, formatSpeed, mmToInches, getWeatherIcon }) {
  if (!data) return (
    <div className="forecast">
      <h2>Today's Forecast</h2>
      <p>No forecast data available</p>
    </div>
  );

  const { forecast, location } = data;
  const day = forecast.forecastday[0].day;
  // Only show every 3 hours (0, 3, 6, ..., 21)
  const hourly = forecast.forecastday[0].hour.filter((h, idx) => idx % 3 === 0);

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
            <div key={hour.time_epoch} className="hour-item">
              <span className="hour-time">{new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <img src={getWeatherIcon(hour.condition.code, hour.is_day)} alt={hour.condition.text} className="hour-icon" />
              <span className="hour-temp">{formatTemp(hour.temp_c, units?.temp)}</span>
              <span className="hour-cond">{hour.condition.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Forecast;