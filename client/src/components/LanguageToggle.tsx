import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLanguage(language === "en" ? "he" : "en")}
      className="w-10 h-10 font-bold"
    >
      {language === "en" ? "עב" : "EN"}
      <span className="sr-only">Toggle language</span>
    </Button>
  );
}
