import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/hooks/use-language";
import { SiFacebook } from "react-icons/si";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface SessionLink {
  webUrl: string;
  mobileUrl: string;
  number: number;
}

interface SessionGroup {
  name: string;
  links: SessionLink[];
}

const getMobileUrl = (webUrl: string) => {
  const postId = webUrl.split('pfbid')[1];
  return postId ? `fb://post/pfbid${postId}` : webUrl;
};

async function fetchImages(category: string): Promise<SessionLink[]> {
  const response = await fetch(`/api/sessions/${category}`);
  if (!response.ok) throw new Error('Failed to fetch images');
  return response.json();
}

export default function MySessions() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<{ url: string; number: number; groupName: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const [groups, setGroups] = useState<SessionGroup[]>([]);
  const [lastClickTime, setLastClickTime] = useState(0);

  useEffect(() => {
    async function loadImages() {
      const categories = ['Bat_Mitsva', 'Family', 'Horses', 'Kids', 'Modeling', 'Feminine', 'Yoga'];
      const loadedGroups = await Promise.all(
        categories.map(async (category) => {
          try {
            const images = await fetchImages(category);
            return {
              name: category.replace('_', ' '),
              links: images
            };
          } catch (error) {
            console.error(`Error loading ${category} images:`, error);
            return null;
          }
        })
      );
      setGroups(loadedGroups.filter((g): g is SessionGroup => g !== null));
    }
    loadImages();
  }, []);

  const handleImageClick = (event: React.MouseEvent | React.TouchEvent, link: SessionLink, groupName: string) => {
    event.preventDefault();
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;

    if (timeDiff < 300) { // Double click/tap
      const url = isMobile ? getMobileUrl(link.webUrl) : link.webUrl;
      window.open(url, '_blank');
    } else { // Single click/tap
      setSelectedImage({ 
        url: `/assets/facebook_posts_image/${categoryMappings[groupName]}/${link.number}.jpg`,
        number: link.number, 
        groupName 
      });
      setIsDialogOpen(true);
    }
    setLastClickTime(currentTime);
  };

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

  const capitalizeWords = (str: string) => {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
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
            <div key={group.name} className="bg-card p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">
                {language === 'he' ? t(`sessions.${group.name}`) : group.name}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {group.links.map((link) => (
                  <div
                    key={link.webUrl}
                    className="relative cursor-pointer"
                    onClick={(e) => handleImageClick(e, link, group.name)}
                  >
                    <motion.div
                      className="aspect-square rounded-lg overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                    >
                      <img 
                        src={`/assets/facebook_posts_image/${categoryMappings[group.name]}/${link.number}.jpg`}
                        alt={`${group.name} session ${link.number}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl w-[90vw]">
          {selectedImage && (
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={selectedImage.url}
              alt={`${selectedImage.groupName} session ${selectedImage.number}`}
              className="w-full h-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}