import React, { useState } from 'react';


function IPLookup({ onSearch }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsLoading(true);
      onSearch(query.trim())
        .finally(() => setIsLoading(false));
    }
  };

  return (
    <div className="ip-lookup">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter location (city, zip code, IP, or coordinates)"
          className="search-input"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="search-button"
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
   
      </form>
    </div>
  );
}


export default IPLookup