import React from "react";

const CountryCodeDropdown = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="p-2 border border-border text-gray-800 bg-white mr-2"
  >
    <option value="+91">+91</option>
    <option value="+1">+1</option>
    <option value="+44">+44</option>
  </select>
);

export default CountryCodeDropdown;
