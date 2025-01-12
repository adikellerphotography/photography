import { useLanguage } from "./use-language";
import { translations } from "@/lib/translations";

type TranslationKeys = {
  [K in keyof typeof translations.en]: (typeof translations.en)[K] extends object
    ? { [SubK in keyof (typeof translations.en)[K]]: string }
    : string;
};

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation missing for key: ${key} in language: ${language}`);
        return key;
      }
    }

    return value as string;
  };

  return { t };
}