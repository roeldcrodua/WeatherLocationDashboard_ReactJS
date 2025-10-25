import React from 'react';

function Forecast({ data, units, formatTemp, formatSpeed, mmToInches }) {
  if (!data) return (
    <div className="forecast">
      <h2>Today's Forecast</h2>
      <p>No forecast data available</p>
    </div>
  );

  const { forecast, location } = data;
  const day = forecast.forecastday[0].day;

  return (
    <div className="forecast">
      <h2>Today's Forecast for {location.name}</h2>
      <div className="forecast-details">
        <div className="forecast-main">
          <img 
            src={day.condition.icon} 
            alt={day.condition.text}
            className="weather-icon"
          />
          <p className="condition">{day.condition.text}</p>
        </div>
        
        <div className="temperature-range">
          <div className="temp-item">
            <span>Maximum</span>
            <span className="temp">{formatTemp(day.maxtemp_c, units?.temp)}</span>
          </div>
          <div className="temp-item">
            <span>Minimum</span>
            <span className="temp">{formatTemp(day.mintemp_c, units?.temp)}</span>
          </div>
          <div className="temp-item">
            <span>Average</span>
            <span className="temp">{formatTemp(day.avgtemp_c, units?.temp)}</span>
          </div>
        </div>

        <div className="forecast-info-grid">
          <div className="info-item">
            <span>Max Wind</span>
            <span>{formatSpeed(day.maxwind_kph, units)}</span>
          </div>
          <div className="info-item">
            <span>Total Precipitation</span>
            <span>{units?.distance === 'mi' ? `${mmToInches(day.totalprecip_mm).toFixed(2)} in` : `${day.totalprecip_mm} mm`}</span>
          </div>
          <div className="info-item">
            <span>Average Humidity</span>
            <span>{day.avghumidity}%</span>
          </div>
          <div className="info-item">
            <span>UV Index</span>
            <span>{day.uv}</span>
          </div>
          <div className="info-item">
            <span>Rain Chance</span>
            <span>{day.daily_chance_of_rain}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Forecast;