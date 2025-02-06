import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useTranslation } from "@/hooks/use-translation";
import { Compass, Camera, PackageCheck, CalendarCheck } from "lucide-react";

export default function Info() {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`container mx-auto px-4 py-16 ${language === 'he' ? 'rtl' : 'ltr'}`}
      >
        <div className="max-w-3xl mx-auto">
          <div className={language === 'he' ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold mb-8 text-[#FF9500] text-center">{t("info.title")}</h1>

            <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
              <div>
                <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${language === 'he' ? 'justify-end w-full' : ''}`}>
                  <Compass className="w-6 h-6 text-[#FF9500]" />
                  {t("info.sessionTitle")}
                </h2>
                <p className="text-lg leading-relaxed">
                  {t("info.sessionDescription")}
                </p>
              </div>

              <div>
                <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${language === 'he' ? 'justify-end w-full' : ''}`}>
                  <Camera className="w-6 h-6 text-[#FF9500]" />
                  {t("info.equipmentTitle")}
                </h2>
                <p className="text-lg leading-relaxed">
                  {t("info.equipmentDescription")}
                </p>
              </div>

              <div>
                <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${language === 'he' ? 'justify-end w-full' : ''}`}>
                  <PackageCheck className="w-6 h-6 text-[#FF9500]" />
                  {t("info.preparationTitle")}
                </h2>
                <p className="text-lg leading-relaxed">
                  {t("info.preparationDescription")}
                </p>
              </div>

              <div>
                <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${language === 'he' ? 'justify-end w-full' : ''}`}>
                  <CalendarCheck className="w-6 h-6 text-[#FF9500]" />
                  {t("info.meetingTitle")}
                </h2>
                <p className="text-lg leading-relaxed">
                  {t("info.meetingDescription")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.button
        className={`fixed bottom-6 right-6 p-3 rounded-full bg-[#FF9500] text-black shadow-lg transition-all ${
          scrollY > 200 ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
        onClick={scrollToTop}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ArrowUp className="h-5 w-5" />
      </motion.button>
    </div>
  );
}