
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { Languages } from "lucide-react";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLanguage(language === "en" ? "he" : "en")}
      className="w-10 h-10 flex items-center justify-center relative"
      title={language === "en" ? "Switch to Hebrew" : "Switch to English"}
    >
      <Languages className="h-[1.4rem] w-[1.4rem] transition-transform duration-200" />
      <span className="sr-only">
        {language === "en" ? "Switch to Hebrew" : "Switch to English"}
      </span>
    </Button>
  );
}
