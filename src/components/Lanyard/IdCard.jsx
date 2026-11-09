import React from 'react';
import './IdCard.css';

export default function IdCard() {
  return (
    <div className="id-card-wrapper" style={{ width: '250px', height: '400px', pointerEvents: 'auto' }}>
      <div className="scene">
        <div className="lanyard">
          <div className="lanyard-strap"></div>
          <div className="lanyard-clip"></div>
          <div className="lanyard-hook"></div>
        </div>
        <div className="card-shell">
          <div className="card">
            <div className="card-glow"></div>
            <div className="card-logo">
              <div className="logo-circle">LA</div>
              <span className="logo-text">Dev+Design</span>
            </div>
            <div className="photo-area" style={{ display: 'block' }}>
              <img id="photo-img" src="./my_avatar.png" alt="Liyakhad Ali" />
            </div>
            <div className="card-content">
              <div className="name-block">
                <div className="card-name">
                  Liyakhad <span className="last">Ali</span>
                </div>
                <div className="card-title">
                  Fullstack Developer<br />&amp; UI/UX Designer
                </div>
                <div className="title-line"></div>
              </div>
            </div>
            <div className="scan-lines">
              <div className="scan-line" style={{width: '50px'}}></div>
              <div className="scan-line" style={{width: '35px'}}></div>
              <div className="scan-line" style={{width: '42px'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
