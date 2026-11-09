import React from 'react';
import './IdCard.css';

export default function IdCardBack() {
  return (
    <div className="id-card-wrapper" style={{ width: '250px', height: '400px', pointerEvents: 'auto' }}>
      <div className="scene">
        <div className="card-shell">
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
            <img src="/models/back-content-transparent.png" alt="Back Content" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
