import React, { createContext, useContext, useState } from 'react';

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
];

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem('yc_lang') || 'en'
  );
  const [selectedAsana, setSelectedAsana] = useState(null);

  const changeLanguage = (code) => {
    localStorage.setItem('yc_lang', code);
    setLanguage(code);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        changeLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
        selectedAsana,
        setSelectedAsana,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
