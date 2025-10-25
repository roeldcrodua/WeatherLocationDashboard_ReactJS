import React from "react";

function SearchHistory({ history, onSelect }) {
  if (!history || history.length === 0) {
    return (
      <div className="search-history">
        <h2>Search History</h2>
        <p>No search history yet</p>
      </div>
    );
  }

  return (
    <div className="search-history">
      <h2>Search History</h2>
      <div className="history-list">
        {history.map((item) => (
          <div 
            key={item.id}
            className="history-item"
            onClick={() => onSelect(item.query)}
          >
            <p>{item.query}</p>
            <p className="timestamp">
              {new Date(item.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchHistory;