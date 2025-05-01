import React from 'react';

const ProgressBar = ({ title, current, max, color }) => {
  // Calculate the percentage completion
  const percentage = Math.min(100, (current / max) * 100);
  
  return (
    <div className="progress-container" style={{
      width: '100%',
      marginBottom: '20px'
    }}>
      {/* Title and current value display */}
      <div className="progress-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '5px'
      }}>
        <span className="progress-title" style={{
          fontSize: '12px',
          fontWeight: '100',
          color: 'white',
          opacity: 0.7
        }}>
          {title}
        </span>
        {/* <span className="progress-value" style={{
          fontSize: '12px',
          fontWeight: '100',
          color: 'white',
          opacity: 0.7
        }}>
          {current}
        </span> */}
      </div>
      
      {/* The actual progress bar */}
      <div className="progress-bar-container" style={{
        height: '10px',
        backgroundColor: '#e0e0e0',
        borderRadius: '9999px',
        overflow: 'hidden',
      }}>
        <div className="progress-bar-fill" style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: '9999px',
          transition: 'width 0.3s ease',

        }} />
      </div>
    </div>
  );
};

export default ProgressBar;