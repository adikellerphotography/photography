import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/hooks/use-language";
import { SiFacebook } from "react-icons/si";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface SessionLink {
  url: string;
  number: number;
}

interface SessionGroup {
  name: string;
  links: SessionLink[];
}

interface SelectedImage {
  url: string;
  number: number;
  groupName: string;
  fbUrl?: string;
}

const categoryMappings: Record<string, string> = {
  'Kids': 'kids',
  'Bat Mitsva': 'bat_mitsva',
  'Bar Mitsva': 'bar_mitsva',
  'Family': 'family',
  'Big Family': 'big_family',
  'Horses': 'horses',
  'Modeling': 'modeling',
  'Feminine': 'feminine',
  'Sweet 16': 'sweet_16',
  'Purim': 'purim',
  'Pregnancy': 'pregnancy',
  'Yoga': 'yoga'
};

async function fetchImages(category: string): Promise<SessionLink[]> {
  try {
    const response = await fetch(`/api/sessions/${category}`);
    if (!response.ok) throw new Error('Failed to fetch images');
    return response.json();
  } catch (error) {
    console.error(`Error fetching ${category} images:`, error);
    return [];
  }
}

const capitalizeWords = (str: string) => {
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export default function MySessions() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const [groups, setGroups] = useState<SessionGroup[]>([]);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  const clickCount = useRef(0);

  useEffect(() => {
    async function loadImages() {
      const categories = ['Bat_Mitsva', 'Family', 'Horses', 'Kids', 'Modeling', 'Feminine', 'Yoga'];
      const loadedGroups = await Promise.all(
        categories.map(async (category) => {
          const images = await fetchImages(category);
          return {
            name: category.replace('_', ' '),
            links: images
          };
        })
      );
      setGroups(loadedGroups.filter(g => g.links.length > 0));
    }
    loadImages();
  }, []);

  const handleImageInteraction = (event: React.MouseEvent | React.TouchEvent, link: SessionLink, groupName: string) => {
    event.preventDefault();

    if (isMobile) {
      // Mobile touch handling
      clickCount.current += 1;

      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
      }

      clickTimer.current = setTimeout(() => {
        if (clickCount.current === 1) {
          // Single tap - show image
          setSelectedImage({
            url: `/assets/facebook_posts_image/${categoryMappings[groupName]}/${link.number}.jpg`,
            number: link.number,
            groupName,
            fbUrl: link.url
          });
          setIsDialogOpen(true);
        } else if (clickCount.current === 2) {
          // Double tap - open Facebook
          window.open(link.url, '_blank');
        }
        clickCount.current = 0;
      }, 300);
    } else {
      // Desktop click handling
      if ((event as React.MouseEvent).detail === 1) {
        setSelectedImage({
          url: `/assets/facebook_posts_image/${categoryMappings[groupName]}/${link.number}.jpg`,
          number: link.number,
          groupName,
          fbUrl: link.url
        });
        setIsDialogOpen(true);
      } else if ((event as React.MouseEvent).detail === 2) {
        window.open(link.url, '_blank');
      }
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`container mx-auto px-4 py-16 ${language === 'he' ? 'rtl text-right' : 'ltr text-left'}`}
      >
        <h1 className="text-3xl font-bold mb-4 text-[#FF9500]">
          {t("sessions.title")}
        </h1>
        <div className={`flex items-center gap-2 mb-8 ${language === 'he' ? 'justify-end' : ''}`}>
          <SiFacebook className="text-[#1877F2] w-6 h-6 animate-pulse" />
          <span className="text-foreground font-semibold">{t("sessions.description")}</span>
        </div>

        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.name} className={`bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-white/30 ${language === 'he' ? 'rtl' : 'ltr'}`}>
              <div className="mb-4">
                <h2 className="text-2xl font-semibold">
                  {language === 'he' ? t(`sessions.${group.name}`) : capitalizeWords(group.name)}
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {group.links.map((link) => (
                  <div
                    key={`${group.name}-${link.number}`}
                    className="relative cursor-pointer group"
                    onClick={(e) => handleImageInteraction(e, link, group.name)}
                  >
                    <motion.div
                      className="relative aspect-square w-full overflow-hidden rounded-lg"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <img 
                        src={`/assets/facebook_posts_image/${categoryMappings[group.name]}/${link.number}.jpg`}
                        alt={`${group.name} session ${link.number}`}
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
                        loading="lazy"
                        style={{ 
                          backgroundColor: '#f3f4f6',
                          objectFit: 'cover',
                          objectPosition: 'center'
                        }}
                      />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent 
          className="w-screen h-screen !p-0 border-none bg-black/90 shadow-none" 
          onInteractOutside={handleDialogClose}
        >
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative w-full h-full flex items-center justify-center"
              onClick={handleDialogClose}
            >
              <img
                src={selectedImage.url}
                alt={`${selectedImage.groupName} session ${selectedImage.number}`}
                className="w-full h-full object-contain"
                loading="eager"
                decoding="async"
              />
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}