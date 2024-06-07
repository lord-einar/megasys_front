// src/components/ToggleSwitch.jsx
import React from 'react';

const ToggleSwitch = ({ isChecked, onChange, label1, label2 }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={isChecked}
      onChange={onChange}
    />
    <div className={`w-11 h-6 bg-black rounded-full peer-checked:bg-cyan-500`}>
      <div className={`absolute top-0.5 left-[2px] border border-gray-300 rounded-full h-5 w-5 transition-all ${isChecked ? 'bg-yellow-200 translate-x-full border-white' : 'bg-orange-500'}`}></div>
    </div>
    <span className={`ml-3 text-sm font-medium ${isChecked ? 'text-yellow-200' : 'text-orange-500'}`}>
      {isChecked ? label2 : label1}
    </span>
  </label>
);

export default ToggleSwitch;
