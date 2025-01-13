import { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "he";

type LanguageProviderProps = {
  children: React.ReactNode;
  defaultLanguage?: Language;
};

type LanguageProviderState = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const initialState: LanguageProviderState = {
  language: "en",
  setLanguage: () => null,
};

const LanguageProviderContext = createContext<LanguageProviderState>(initialState);

const LANGUAGE_STORAGE_KEY = 'preferred_language';

export function LanguageProvider({
  children,
  defaultLanguage = "en",
}: LanguageProviderProps) {
  // Initialize from localStorage or default
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return (stored as Language) || defaultLanguage;
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
  };

  // Update document direction based on language
  useEffect(() => {
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <LanguageProviderContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageProviderContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext);

  if (context === undefined)
    throw new Error("useLanguage must be used within a LanguageProvider");

  return context;
};