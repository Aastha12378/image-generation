import React from "react";

export interface Country {
  alpha2: string;
  alpha3?: string;
  name: string;
  countryCallingCodes?: string[];
  currencies?: string[];
  ioc?: string;
  languages?: string[];
  status?: string;
}

interface CountryDropdownProps {
  options: Country[];
  onChange: (country: Country) => void;
  defaultValue?: string;
  placeholder?: string;
}

export const CountryDropdown: React.FC<CountryDropdownProps> = ({
  options,
  onChange,
  defaultValue = "",
  placeholder = "Select a country",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = options.find((c) => c.alpha2 === e.target.value);
    if (selected) onChange(selected);
  };

  return (
    <select
      className="w-full border rounded px-3 py-2"
      value={defaultValue}
      onChange={handleChange}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((country) => (
        <option key={country.alpha2} value={country.alpha2}>
          {country.name}
        </option>
      ))}
    </select>
  );
};
