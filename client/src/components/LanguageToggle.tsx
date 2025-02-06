import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { GlobeIcon } from "lucide-react";

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
        <span className="fi fi-us text-lg"></span>
      </div>
      <div className={`absolute transition-all duration-300 ${language === "en" ? "rotate-90 scale-0" : "rotate-0 scale-100"}`}>
        <IL className="h-[1.2rem] w-[1.2rem]" />
      </div>
      <span className="sr-only">
        {language === "en" ? "Switch to Hebrew" : "Switch to English"}
      </span>
    </Button>
  );
}