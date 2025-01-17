
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { SiFacebook } from "react-icons/si";

interface SessionLink {
  url: string;
  number: number;
  images: string[];
}

interface SessionGroup {
  name: string;
  links: SessionLink[];
}

const sessionGroups: SessionGroup[] = [
  {
    name: "Bat Mitsva",
    links: [
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid032zVU11kqanfNEap8Q3iuJrbqo7zHzYY5dzFEb8yPJGR28csyd9H35Prn2vHR2h8Vl", number: 1, images: [
        "/attached_assets/Bat_Mitsva/M68A0288-Edit Large.jpeg",
        "/attached_assets/Bat_Mitsva/M68A0460-Edit-2 Large.jpeg",
        "/attached_assets/Bat_Mitsva/M68A0544-Edit Large.jpeg",
        "/attached_assets/Bat_Mitsva/M68A0765-Edit-Edit Large.jpeg"
      ] },
      // Add more links with images...
    ]
  },
  // Add more groups...
];

export default function FacebookGalleries() {
  const { t } = useTranslation();
  const { language } = useLanguage();

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
                <h2 className="text-2xl font-semibold">{language === 'he' ? t(`sessions.${group.name}`) : group.name}</h2>
                <div className="flex items-center gap-2 bg-[#1877F2]/10 px-3 py-1 rounded-full">
                  <SiFacebook className="text-[#1877F2] w-4 h-4" />
                  <span className="text-sm text-[#1877F2] font-medium">{group.links.length} Posts</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group"
                  >
                    <div className="grid grid-cols-2 gap-1 aspect-square overflow-hidden rounded-lg">
                      {link.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{link.number}</span>
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
