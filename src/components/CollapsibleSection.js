import React, { useState } from 'react';

const CollapsibleSection = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    const toggleOpen = () => {
      setIsOpen(!isOpen);
    };
  
    return (
      <div className="collapsible-section">
        <div 
          className="section-header"
          onClick={toggleOpen}
        >
          <h3 className="section-title">{title}</h3>
          <div className={`section-arrow ${isOpen ? 'open' : ''}`}>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
        
        <div className={`section-content ${!isOpen ? 'closed' : ''}`}>
          {children}
        </div>
      </div>
    );
};

export default CollapsibleSection;