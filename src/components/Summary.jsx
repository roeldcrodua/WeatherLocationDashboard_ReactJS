import React, { useEffect, useState } from 'react';
import { formatTemp as formatTemperature } from '../App';

function Summary({ data, onUnitChange, location }) {
  const { avgTemperature = 0, searchCount = 0, avgForecast = 0 } = data || {};

  // Local unit state: temperature unit and distance unit
  const [tempUnit, setTempUnit] = useState('F'); // 'C' or 'F'
  const [distUnit, setDistUnit] = useState('mi'); // 'mi' or 'km'

  useEffect(() => {
    if (typeof onUnitChange === 'function') {
      onUnitChange({ temp: tempUnit, distance: distUnit });
    }
  }, [tempUnit, distUnit, onUnitChange]);

  const formatTemp = (valueC) => {
    const val = Number(valueC) || 0;
    return formatTemperature(val, tempUnit);
  };

  return (
    <div className="summary">
      <div className="summary-header">
        <h2>Weather Summary{location ? ` - ${location}` : ''}</h2>

        <div className="summary-filters">
          <label htmlFor="temp-select">Temp:</label>
          <select id="temp-select" aria-label="Temp:" value={tempUnit} onChange={(e) => setTempUnit(e.target.value)}>
            <option value="C">Celsius (°C)</option>
            <option value="F">Fahrenheit (°F)</option>
          </select>

          <label htmlFor="dist-select">Distance:</label>
          <select id="dist-select" aria-label="Distance:" value={distUnit} onChange={(e) => setDistUnit(e.target.value)}>
            <option value="mi">Miles (mi)</option>
            <option value="km">Kilometers (km)</option>
          </select>
        </div>
      </div>

      <div className="summary-stats">
        <div className="stat-item">
          <h3>Average Temperature</h3>
          <p>{formatTemp(avgTemperature)}</p>
        </div>
        <div className="stat-item">
          <h3>Searches Made</h3>
          <p>{searchCount}</p>
        </div>
        <div className="stat-item">
          <h3>Average Forecast</h3>
          <p>{formatTemp(avgForecast)}</p>
        </div>
      </div>
    </div>
  );
}

export default Summary;