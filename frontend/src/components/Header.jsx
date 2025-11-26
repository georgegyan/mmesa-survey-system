import React from 'react';
import mmesaLogo from '../assets/images/mmesa-logo.jpg';
import umatLogo from '../assets/images/umat-logo.jpg';

const Header = () => {
  return (
    <header className="header">
      {/* Top Logo Bar */}
      <div className="logo-bar">
        <div className="logo-container">
          <div className="logo-left">
            <img src={umatLogo} alt="U-MAT Logo" className="top-logo" />
          </div>
          <div className="logo-center">
            <div className="main-title">MMESA</div>
            <div className="sub-title">MINING & MINERALS ENGINEERING STUDENTS ASSOCIATION</div>
          </div>
          <div className="logo-right">
            <img src={mmesaLogo} alt="MMESA Logo" className="top-logo" />
          </div>
        </div>
      </div>

      {/* Office of the President Section */}
      <div className="office-section">
        <div className="office-content">
          <div className="office-title">
            OFFICE OF THE PRESIDENT
          </div>
          <div className="university-title">
            UNIVERSITY OF MINES AND TECHNOLOGY
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;