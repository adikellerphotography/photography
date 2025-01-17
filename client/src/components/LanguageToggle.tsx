
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
      className="w-16 h-12 flex items-center justify-center gap-1 group relative overflow-hidden"
    >
      <Globe2 className="h-[1.4rem] w-[1.4rem] transition-all duration-300 group-hover:rotate-180 group-hover:scale-110" />
      <span className="text-sm font-semibold bg-clip-text hover:text-transparent hover:bg-gradient-to-r from-blue-500 to-teal-400 transition-all duration-300">
        {language === "en" ? "HE" : "EN"}
      </span>
      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      <span className="sr-only">
        {language === "en" ? "Switch to Hebrew" : "Switch to English"}
      </span>
    </Button>
  );
}
