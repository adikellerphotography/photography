
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { LanguageIcon, BookA, Languages } from "lucide-react";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLanguage(language === "en" ? "he" : "en")}
      className="w-10 h-10"
    >
      <LanguageIcon className="h-[1.8rem] w-[1.8rem] transition-transform duration-200" />
      <span className="sr-only">
        {language === "en" ? "Switch to Hebrew" : "Switch to English"}
      </span>
    </Button>
  );
}
