// src/components/ToggleSwitch.jsx
import React from 'react';
import './ToggleSwitch.css';

const ToggleSwitch = ({ isMegatlon, onToggle }) => {
  return (
    <label className="toggle-label">
      <input
        type="checkbox"
        className="toggle-input"
        checked={!isMegatlon}
        onChange={onToggle}
      />
      <div className="toggle-slider">
        <div className={`toggle-knob ${isMegatlon ? 'meg-orange' : 'fiter-yellow'}`}></div>
      </div>
      <span className={`toggle-text ${isMegatlon ? 'meg-orange-text' : 'fiter-yellow-text'}`}>
        {isMegatlon ? 'Megatlon' : 'Fiter'}
      </span>
    </label>
  );
};

export default ToggleSwitch;