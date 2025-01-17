
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { Globe2 } from "lucide-react";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLanguage(language === "en" ? "he" : "en")}
      className="w-16 h-12 flex items-center justify-center gap-1"
    >
      <Globe2 className="h-[1.4rem] w-[1.4rem] transition-transform duration-200" />
      <span className="text-sm font-medium">{language === "en" ? "HE" : "EN"}</span>
      <span className="sr-only">
        {language === "en" ? "Switch to Hebrew" : "Switch to English"}
      </span>
    </Button>
  );
}
