import React from 'react';

function Nearby({ locations, onSelect, units, formatDistance }) {
  if (!locations || locations.length === 0) {
    return (
      <div className="nearby">
        <h2>Nearby Locations</h2>
        <p>No nearby locations found</p>
      </div>
    );
  }

  return (
    <div className="nearby">
      <h2>Nearby Locations</h2>
      <div className="locations-list">
        {locations.map((location) => (
          <div 
            key={`${location.code}-${location.city}`}
            className="location-item"
            onClick={() => onSelect(location.code)}
          >
            <p>{location.city}, {location.state}</p>
            <p className="distance">{formatDistance(location.distance, units)} away</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Nearby;