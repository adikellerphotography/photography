
import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";

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
      { 
        url: "https://www.facebook.com/adi.keller.16/posts/pfbid032zVU11kqanfNEap8Q3iuJrbqo7zHzYY5dzFEb8yPJGR28csyd9H35Prn2vHR2h8Vl",
        number: 1,
        images: [
          "/assets/Bat_Mitsva/M68A0288-Edit Large.jpeg",
          "/assets/Bat_Mitsva/M68A0460-Edit-2 Large.jpeg",
          "/assets/Bat_Mitsva/M68A0544-Edit Large.jpeg",
          "/assets/Bat_Mitsva/M68A0765-Edit-Edit Large.jpeg"
        ]
      }
    ]
  },
  {
    name: "Family",
    links: [
      {
        url: "https://www.facebook.com/adi.keller.16/posts/pfbid0WQbN1Y8qMBDcGwVVErv87ydMq2qBuDMY1QWAcrtzSfZdcVRrx81cr6LrMM4HmQ2zl",
        number: 1,
        images: [
          "/assets/Family/IMG_3472-Edit Large.jpeg",
          "/assets/Family/IMG_7812-Edit-3 Large.jpeg",
          "/assets/Family/IMG_7949-Edit Large.jpeg",
          "/assets/Family/M68A0073-Edit Large.jpeg"
        ]
      }
    ]
  },
  {
    name: "Horses",
    links: [
      {
        url: "https://www.facebook.com/adi.keller.16/posts/pfbid0378Rg2GuhDCxdJ2TtaNhmtgsRiH3hZ8obejJsFKs8hVGFGDfMqw4WhCA5yhqQ7TKjl",
        number: 1,
        images: [
          "/assets/Horses/131013950_3532575663456976_669709130935509632_n.jpg",
          "/assets/Horses/131026310_3532575490123660_1967417900678951125_n.jpg",
          "/assets/Horses/131357687_3532575990123610_9100723896979190327_n.jpg",
          "/assets/Horses/296985760_5389736637740860_6958474007824076057_n.jpg"
        ]
      }
    ]
  }
];

const capitalizeWords = (str: string) => {
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export default function FacebookGalleries() {
  const { language } = useLanguage();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
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
        <h1 className="text-3xl font-bold mb-8 text-[#FF9500]">
          Facebook Galleries
        </h1>
        <div className="space-y-8">
          {sessionGroups.map((group) => (
            <div key={group.name} className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-white/30">
              <h2 className="text-2xl font-semibold mb-6">{capitalizeWords(group.name)}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {group.links.map((link) => (
                  <a
                    key={link.url}
                    href={getFacebookUrl(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                    onMouseEnter={() => setHoveredLink(link.url)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="relative aspect-square overflow-hidden rounded-lg border-2 border-[#FF9500]"
                    >
                      <div className="grid grid-cols-2 gap-1 w-full h-full">
                        {link.images.map((image, index) => (
                          <div key={index} className="relative aspect-square overflow-hidden">
                            <img
                              src={image}
                              alt=""
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ))}
                      </div>
                      <div 
                        className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200 ${
                          hoveredLink === link.url ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <span className="text-white text-xl font-semibold">Gallery {link.number}</span>
                      </div>
                    </motion.div>
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
