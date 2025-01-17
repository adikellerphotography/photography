
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { SiFacebook } from "react-icons/si";
import { sessionGroups } from "./Sessions";
import { useIsMobile } from "@/hooks/use-mobile";

const capitalizeWords = (str: string) => {
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export default function FacebookGalleries() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isMobile = useIsMobile();

  const getFacebookUrl = (url: string) => {
    if (isMobile) {
      return `fb://facewebmodal/f?href=${encodeURIComponent(url)}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`container mx-auto px-4 py-16 ${language === 'he' ? 'rtl text-right' : 'ltr text-left'}`}
      >
        <h1 className="text-3xl font-bold mb-4 text-[#FF9500]">
          {t("facebook.title")}
        </h1>
        <div className={`flex items-center gap-2 mb-8 ${language === 'he' ? 'justify-end' : ''}`}>
          <SiFacebook className="text-[#1877F2] w-6 h-6 animate-pulse" />
          <span className="text-foreground font-semibold">{t("facebook.description")}</span>
        </div>
        <div className="space-y-8">
          {sessionGroups.map((group) => (
            <div key={group.name} className={`bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-white/30 ${language === 'he' ? 'rtl' : 'ltr'}`}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-semibold">{language === 'he' ? t(`sessions.${group.name}`) : capitalizeWords(group.name)}</h2>
                <div className="flex items-center gap-2 bg-[#1877F2]/10 px-3 py-1 rounded-full">
                  <SiFacebook className="text-[#1877F2] w-4 h-4" />
                  <span className="text-sm text-[#1877F2] font-medium">{group.links.length} Posts</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.links.map((link) => (
                  <a
                    key={link.url}
                    href={getFacebookUrl(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group"
                  >
                    <div className="grid grid-cols-2 gap-1 aspect-square rounded-lg overflow-hidden bg-gray-100">
                      {[1, 2, 3, 4].map((num) => (
                        <div key={num} className="relative w-full h-full">
                          <img
                            src={`/attached_assets/${group.name.replace(/\s+/g, '_')}/${link.number}-${num}.jpg`}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/attached_assets/placeholder.jpg';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
                      <span className="text-2xl font-bold text-white">{link.number}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
