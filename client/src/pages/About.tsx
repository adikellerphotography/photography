import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import SocialLinks from "@/components/SocialLinks";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useState } from "react";

export default function About() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="min-h-screen pt-8">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 w-full max-w-[300px] mx-auto">
            <AspectRatio ratio={1}>
              <div className="relative w-full h-full overflow-hidden rounded-full">
                <AnimatePresence mode="wait">
                  {!imageLoaded && (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-muted animate-pulse"
                    />
                  )}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: imageLoaded ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full"
                  >
                    <img
                      src="/attached_assets/IMG_1133.jpg"
                      alt="Profile"
                      className="object-cover w-full h-full transform-gpu"
                      width={300}
                      height={300}
                      loading="eager"
                      decoding="async"
                      fetchpriority="high"
                      onLoad={() => setImageLoaded(true)}
                      style={{
                        willChange: 'transform',
                        backfaceVisibility: 'hidden'
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </AspectRatio>
          </div>

          <div className={language === 'he' ? 'rtl text-right' : 'ltr text-left'}>
            <h1 className="text-3xl font-bold mb-8 text-[#FF9500]">{t("about.title")}</h1>

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

            <div className="mt-12 text-center">
              <Link href="/contact">
                <Button className="bg-white hover:bg-gray-100 text-gray-800 text-lg px-8 py-6 border border-gray-300 shadow-sm hover:shadow-md transition-all">
                  Contact Me
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}