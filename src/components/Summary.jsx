import React, { useEffect, useState } from 'react';

function Summary({ data, onUnitChange }) {
  const { avgTemperature = 0, searchCount = 0, avgForecast = 0 } = data || {};

  // Local unit state: temperature unit and distance unit
  const [tempUnit, setTempUnit] = useState('F'); // 'C' or 'F'
  const [distUnit, setDistUnit] = useState('mi'); // 'mi' or 'km'

  useEffect(() => {
    if (typeof onUnitChange === 'function') {
      onUnitChange({ temp: tempUnit, distance: distUnit });
    }
  }, [tempUnit, distUnit, onUnitChange]);

  const cToF = (c) => (c * 9) / 5 + 32;

  const formatTemp = (valueC) => {
    const val = Number(valueC) || 0;
    if (tempUnit === 'F') return `${Math.round(cToF(val))}°F`;
    return `${Math.round(val)}°C`;
  };

  return (
    <div className="summary">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>Weather Summary</h2>

        <div className="summary-filters" style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
          <label htmlFor="temp-select" style={{fontSize: '0.9rem'}}>Temp:</label>
          <select id="temp-select" aria-label="Temp:" value={tempUnit} onChange={(e) => setTempUnit(e.target.value)}>
            <option value="C">Celsius (°C)</option>
            <option value="F">Fahrenheit (°F)</option>
          </select>

          <label htmlFor="dist-select" style={{fontSize: '0.9rem'}}>Distance:</label>
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