/**
 * Loader Component
 * 
 * Loading spinner with multiple size options.
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Size configurations
 */
const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
  xl: 'w-16 h-16 border-4',
};

/**
 * Loader Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Size variant (sm, md, lg, xl)
 * @param {string} props.className - Additional CSS classes
 */
const Loader = ({ size = 'md', className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`spinner ${sizes[size]}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

Loader.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
};

export default Loader;
