// Fun meme popups for login, income, and expense events

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';

// Defined outside component to avoid recreation on each render
const popupConfig = {
  login: {
    image: '/images/cat-hello.jpg',
    alt: 'Cat saying hello',
    duration: 2500,
  },
  income: {
    image: '/images/money-throw.gif',
    alt: 'Throwing money',
    duration: 3000,
  },
  expense: {
    images: [
      { src: '/images/spending-mirror.jpg', alt: 'When are you going to stop spending?' },
      { src: '/images/bank-account.jpg', alt: 'Checking bank account after living your best life' },
    ],
    duration: 3000,
  },
};

const FunPopup = ({ type, show, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (show && type) {
      setIsVisible(true);
      setIsExiting(false);
      
      const config = popupConfig[type];
      if (config) {
        timerRef.current = setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            setIsVisible(false);
            if (onClose) onClose();
          }, 300);
        }, config.duration || 2500);
      }

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [show, type, onClose]);

  if (!isVisible || !type) return null;

  const config = popupConfig[type];
  if (!config) return null;

  // For expenses, pick a random meme
  const getImageData = () => {
    if (type === 'expense' && config.images) {
      const randomIndex = Math.floor(Math.random() * config.images.length);
      return config.images[randomIndex];
    }
    return { src: config.image, alt: config.alt };
  };

  const imageData = getImageData();

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none
        ${isExiting ? 'animate-fade-out' : 'animate-pop-in'}`}
    >
      <div
        className={`relative max-w-xs sm:max-w-sm transform transition-all duration-300
          ${isExiting ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-accent-500/50">
          <img
            src={imageData.src}
            alt={imageData.alt}
            className="w-full h-auto max-h-[300px] object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              if (onClose) onClose();
            }}
          />
          <div className="absolute inset-0 rounded-2xl ring-4 ring-accent-500/30 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

FunPopup.propTypes = {
  type: PropTypes.oneOf(['login', 'income', 'expense']),
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

export default FunPopup;
