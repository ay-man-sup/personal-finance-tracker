// Context for triggering fun meme popups from anywhere in the app

import React, { createContext, useContext, useState, useCallback } from 'react';
import FunPopup from '../components/common/FunPopup';

const FunPopupContext = createContext();

export const FunPopupProvider = ({ children }) => {
  const [popupState, setPopupState] = useState({
    show: false,
    type: null,
  });

  const showPopup = useCallback((type) => {
    setPopupState({ show: true, type });
  }, []);

  const closePopup = useCallback(() => {
    setPopupState({ show: false, type: null });
  }, []);

  return (
    <FunPopupContext.Provider value={{ showPopup }}>
      {children}
      <FunPopup
        type={popupState.type}
        show={popupState.show}
        onClose={closePopup}
      />
    </FunPopupContext.Provider>
  );
};

export const useFunPopup = () => {
  const context = useContext(FunPopupContext);
  if (!context) {
    throw new Error('useFunPopup must be used within a FunPopupProvider');
  }
  return context;
};

export default FunPopupContext;
