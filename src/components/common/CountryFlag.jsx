import React from 'react';
import ReactCountryFlag from 'react-country-flag';
import { isValidCountryCode } from '../../utils/countryUtils';

/**
 * Renders an SVG country flag for a given ISO 3166-1 alpha-2 code.
 *
 * Supports all 249+ ISO countries plus special cases (e.g. XK for Kosovo).
 * Falls back to displaying the raw code or "—" for invalid / missing input.
 *
 * @param {string|null|undefined} countryCode        ISO alpha-2 country code
 * @param {number}                [size=20]          Flag width & height in px
 * @param {boolean}               [showFallbackText=true] Show the raw code when no flag match
 * @param {string}                [className]        Extra CSS class
 */
const CountryFlag = ({
  countryCode,
  size = 20,
  showFallbackText = true,
  className = '',
}) => {
  if (!countryCode || typeof countryCode !== 'string') {
    return showFallbackText ? <span className={className}>—</span> : null;
  }

  const normalizedCode = countryCode.trim().toUpperCase();

  if (!normalizedCode) {
    return showFallbackText ? <span className={className}>—</span> : null;
  }

  if (!isValidCountryCode(normalizedCode)) {
    return showFallbackText ? (
      <span className={className}>{normalizedCode}</span>
    ) : null;
  }

  return (
    <ReactCountryFlag
      countryCode={normalizedCode}
      svg
      style={{
        width: size,
        height: size,
      }}
      className={className}
      aria-label={normalizedCode}
    />
  );
};

export default React.memo(CountryFlag);
