import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import SocialLinks from "@/components/SocialLinks";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function About() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen pt-8">
      <div
        className="container mx-auto px-4 py-16"
      >
        <div className="max-w-3xl mx-auto">
          {/* Portrait Image Section */}
          <div className="mb-12 w-full max-w-[300px] mx-auto">
            <AspectRatio ratio={1}>
              <div 
                className="relative w-full h-full overflow-hidden rounded-full"
              >
                <img
                  src="/assets/IMG_1133.jpg"
                  alt="Profile"
                  className="object-cover w-full h-full"
                  width={300}
                  height={300}
                  loading="eager"
                  decoding="sync"
                  fetchpriority="high"
                  style={{
                    WebkitBackfaceVisibility: 'hidden',
                    WebkitTransform: 'translate3d(0, 0, 0)',
                    WebkitPerspective: '1000px',
                    WebkitTransformStyle: 'preserve-3d'
                  }}
                />
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