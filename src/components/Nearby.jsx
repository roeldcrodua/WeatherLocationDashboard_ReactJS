import React from 'react';

function Nearby({ locations, onSelect, units, formatDistance, searchRadius, onRadiusChange }) {
  const handleRadiusChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 100) { // Limit to reasonable range
      onRadiusChange(value);
    }
  };

  return (
    <div className="nearby">
      <div className="nearby-header">
        <h2>Nearby Locations</h2>
        <div className="radius-control">
          <label htmlFor="search-radius">
            Search Radius:
          </label>
          <div className="radius-input-group">
            <input
              id="search-radius"
              type="number"
              min="1"
              max="100"
              value={searchRadius}
              onChange={handleRadiusChange}
              className="radius-input"
            />
            <span className="radius-unit">
              {units?.distance === 'km' ? 'km' : 'miles'}
            </span>
          </div>
        </div>
      </div>
      
      {!locations || locations.length === 0 ? (
        <p>No nearby locations found. It works only for US zip codes</p>
      ) : (
        <div className="locations-list">
          {locations.map((location) => (
            <div 
              key={`${location.code}-${location.city}`}
              className="location-item"
              onClick={() => onSelect(location.code)}
            >
              <p>{location.code} - {location.city}, {location.state}</p>
              <p className="distance">{formatDistance(location.distance, units)} away</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Nearby;