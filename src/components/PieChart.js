import React from 'react';
import './PieChart.css';

const PieChart = ({ 
  title, 
  icon, 
  current, 
  max, 
  color = '#3b82f6',
  unit = '',
  radius = 70, 
  strokeWidth = 10 
}) => {
  const percentage = Math.min(100, (current / max) * 100);
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const size = radius * 2;
  const center = size / 2;
  const viewBox = `0 0 ${size} ${size}`;

  return (
    <div className="pie-chart-wrapper" style={{ width: size, height: size }}>
      <svg height={size} width={size} viewBox={viewBox}>
        <circle
          stroke="#e0e0e0"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={center}
          cy={center}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          r={normalizedRadius}
          cx={center}
          cy={center}
        />
      </svg>

      <div className="pie-chart-center-content">
        <div className="icon" style={{ color: color }}>
          {icon}
        </div>
        <div className="title">
          {title}
        </div>
        <div className="count">
          {current}{unit && <span className="unit"> {unit}</span>}
        </div>
      </div>
    </div>
  );
};

export default PieChart;