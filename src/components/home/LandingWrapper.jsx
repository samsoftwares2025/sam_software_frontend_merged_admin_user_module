// components/home/LandingWrapper.jsx
import React from 'react';

const LandingWrapper = ({ children }) => {
  return (
    <div className="samsoftware-landing-page">
      {children}
    </div>
  );
};

export default LandingWrapper;