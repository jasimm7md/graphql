import React from 'react';

function Graph() {
  return (
    <div className="graph">
      <h3>Statistics</h3>
      <svg viewBox="0 0 400 200" width="100%" height="100%">
        {/* Example SVG graph */}
        <rect x="10" y="10" width="50" height="150" fill="blue" />
        <rect x="70" y="30" width="50" height="130" fill="green" />
      </svg>
      <svg viewBox="0 0 400 200" width="100%" height="100%">
        {/* Another example SVG graph */}
        <circle cx="50" cy="50" r="40" fill="red" />
        <circle cx="150" cy="50" r="40" fill="yellow" />
      </svg>
    </div>
  );
}

export default Graph;
