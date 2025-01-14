import { motion } from "framer-motion";
import SocialLinks from "@/components/SocialLinks";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function About() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="max-w-3xl mx-auto">
          {/* Portrait Image Section */}
          <div className="mb-12 w-full max-w-[280px] mx-auto">
            <AspectRatio ratio={1}>
              <div className="relative w-full h-full overflow-hidden rounded-full border-4 border-background shadow-xl">
                <img
                  src="/assets/IMG_1133_optimized.jpg"
                  alt=""
                  className="object-cover w-full h-full"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            </AspectRatio>
          </div>

          <div className={language === 'he' ? 'rtl text-right' : 'ltr text-left'}>
            <h1 className="text-3xl font-bold mb-8">{t("about.title")}</h1>

            <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
              <div>
                <p className="text-lg leading-relaxed">
                  {t("about.welcome")}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">{t("about.approachTitle")}</h2>
                <p className="text-lg leading-relaxed">
                  {t("about.approach")}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">{t("about.styleTitle")}</h2>
                <p className="text-lg leading-relaxed">
                  {t("about.style")}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">{t("about.experienceTitle")}</h2>
                <p className="text-lg leading-relaxed">
                  {t("about.experience")}
                </p>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-4">{t("about.connect")}</h2>
              <SocialLinks />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}