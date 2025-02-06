
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import ReactCountryFlag from "react-country-flag";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLanguage(language === "en" ? "he" : "en")}
      className="w-10 h-10 relative"
      title={language === "en" ? "Switch to Hebrew" : "Switch to English"}
    >
      <div className={`absolute transition-all duration-300 ${language === "en" ? "rotate-0 scale-100" : "rotate-90 scale-0"}`}>
        <ReactCountryFlag countryCode="IL" style={{ width: '1.2rem', height: '1.2rem' }} svg />
      </div>
      <div className={`absolute transition-all duration-300 ${language === "en" ? "rotate-90 scale-0" : "rotate-0 scale-100"}`}>
        <ReactCountryFlag countryCode="US" style={{ width: '1.2rem', height: '1.2rem' }} svg />
      </div>
      <span className="sr-only">
        {language === "en" ? "Switch to Hebrew" : "Switch to English"}
      </span>
    </Button>
  );
}
