import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useTranslation } from "@/hooks/use-translation";

export default function Info() {
  const { language } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="max-w-3xl mx-auto">
          <div className={language === 'he' ? 'rtl text-right' : 'ltr text-left'}>
            <h1 className="text-3xl font-bold mb-8">{t("info.title")}</h1>

            <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4">{t("info.sessionTitle")}</h2>
                <p className="text-lg leading-relaxed">
                  {t("info.sessionDescription")}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">{t("info.equipmentTitle")}</h2>
                <p className="text-lg leading-relaxed">
                  {t("info.equipmentDescription")}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">{t("info.preparationTitle")}</h2>
                <p className="text-lg leading-relaxed">
                  {t("info.preparationDescription")}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">{t("info.meetingTitle")}</h2>
                <p className="text-lg leading-relaxed">
                  {t("info.meetingDescription")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}