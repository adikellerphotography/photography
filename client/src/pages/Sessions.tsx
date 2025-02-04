import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/hooks/use-language";
import { SiFacebook } from "react-icons/si";
import { HandClick, MousePointerClick, ArrowUp } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SessionLink {
  url: string;
  number: number;
}

interface SessionGroup {
  name: string;
  links: SessionLink[];
}

const sessionGroups: SessionGroup[] = [
  {
    name: "Bat Mitsva",
    links: Array.from({ length: 14 }, (_, i) => ({
      url: `https://www.facebook.com/adi.keller.16/posts/pfbid${i + 1}`,
      number: i + 1
    }))
  },
  {
    name: "Horses",
    links: Array.from({ length: 6 }, (_, i) => ({
      url: `https://www.facebook.com/adi.keller.16/posts/pfbid${i + 1}`,
      number: i + 1
    }))
  },
  {
    name: "Kids",
    links: Array.from({ length: 6 }, (_, i) => ({
      url: `https://www.facebook.com/adi.keller.16/posts/pfbid${i + 1}`,
      number: i + 1
    }))
  },
  {
    name: "Family",
    links: Array.from({ length: 5 }, (_, i) => ({
      url: `https://www.facebook.com/adi.keller.16/posts/pfbid${i + 1}`,
      number: i + 1
    }))
  },
  {
    name: "Big Family",
    links: Array.from({ length: 3 }, (_, i) => ({
      url: `https://www.facebook.com/adi.keller.16/posts/pfbid${i + 1}`,
      number: i + 1
    }))
  },
  {
    name: "Sweet 16",
    links: Array.from({ length: 3 }, (_, i) => ({
      url: `https://www.facebook.com/adi.keller.16/posts/pfbid${i + 1}`,
      number: i + 1
    }))
  },
  {
    name: "Purim",
    links: Array.from({ length: 3 }, (_, i) => ({
      url: `https://www.facebook.com/adi.keller.16/posts/pfbid${i + 1}`,
      number: i + 1
    }))
  },
  {
    name: "Pregnancy",
    links: Array.from({ length: 2 }, (_, i) => ({
      url: `https://www.facebook.com/adi.keller.16/posts/pfbid${i + 1}`,
      number: i + 1
    }))
  },
  {
    name: "Femininity",
    links: Array.from({ length: 7 }, (_, i) => ({
      url: `https://www.facebook.com/adi.keller.16/posts/pfbid${i + 1}`,
      number: i + 1
    }))
  },
  {
    name: "Yoga",
    links: Array.from({ length: 11 }, (_, i) => ({
      url: `https://www.facebook.com/adi.keller.16/posts/pfbid${i + 1}`,
      number: i + 1
    }))
  },
  {
    name: "Modeling",
    links: Array.from({ length: 8 }, (_, i) => ({
      url: `https://www.facebook.com/adi.keller.16/posts/pfbid${i + 1}`,
      number: i + 1
    }))
  },
  {
    name: "Bar Mitsva",
    links: Array.from({ length: 5 }, (_, i) => ({
      url: `https://www.facebook.com/adi.keller.16/posts/pfbid${i + 1}`,
      number: i + 1
    }))
  }
];

const capitalizeWords = (str: string) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const categoryMappings: Record<string, string> = {
  Kids: "kids",
  "Bat Mitsva": "bat_mitsva",
  "Bar Mitsva": "bar_mitsva",
  Family: "family",
  "Big Family": "big_family",
  Horses: "horses",
  Modeling: "modeling",
  Femininity: "feminine",
  "Sweet 16": "sweet_16",
  Purim: "purim",
  Pregnancy: "pregnancy",
  Yoga: "yoga",
};

export default function Sessions() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    number: number;
    groupName: string;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const clickTimer = useRef<number>(0);
  const [groups] = useState<SessionGroup[]>(sessionGroups);
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToGroup = (groupName: string) => {
    const element = groupRefs.current[groupName];
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getFacebookUrl = (url: string) => {
    if (isMobile) {
      const postId = url.split("pfbid")[1];
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        return `fb://profile/adi.keller.16/posts/pfbid${postId}`;
      }
      if (/Android/.test(navigator.userAgent)) {
        return `intent://facebook.com/adi.keller.16/posts/pfbid${postId}#Intent;package=com.facebook.katana;scheme=https;end`;
      }
    }
    return url;
  };

  const handleImageClick = (
    event: React.MouseEvent | React.TouchEvent,
    link: SessionLink,
    groupName: string
  ) => {
    event.preventDefault();
    const now = Date.now();

    if (clickTimer.current && now - clickTimer.current < 300) {
      clickTimer.current = 0;
      setIsDialogOpen(false);
      window.open(link.url, "_blank", "noopener,noreferrer");
    } else {
      clickTimer.current = now;
      setTimeout(() => {
        if (clickTimer.current !== 0) {
          window.history.pushState(
            { isGalleryView: true },
            "",
            window.location.pathname
          );
          setSelectedImage({
            url: `/attached_assets/facebook_posts_image/${categoryMappings[groupName]}/${link.number}.jpg`,
            number: link.number,
            groupName,
          });
          setIsDialogOpen(true);
        }
        clickTimer.current = 0;
      }, 300);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setIsDialogOpen(false);
      setSelectedImage(null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="min-h-screen pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`container mx-auto px-4 py-16 ${
          language === "he" ? "rtl text-right" : "ltr text-left"
        }`}
      >
        <h1 className="text-3xl font-bold mb-4 text-[#FF9500]">
          {t("sessions.title")}
        </h1>

        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b mb-8 py-4">
          <div className="flex flex-wrap gap-2">
            {groups.map((group) => (
              <Button
                key={group.name}
                variant="ghost"
                size="sm"
                onClick={() => scrollToGroup(group.name)}
                className="text-sm"
              >
                {language === "he"
                  ? t(`sessions.${group.name}`)
                  : capitalizeWords(group.name)}
              </Button>
            ))}
          </div>
        </nav>

        <div className="space-y-8">
          {groups.map((group) => (
            <div
              key={group.name}
              ref={(el) => (groupRefs.current[group.name] = el)}
              className={`bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-white/30 ${
                language === "he" ? "rtl" : "ltr"
              }`}
            >
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-semibold">
                  {language === "he"
                    ? t(`sessions.${group.name}`)
                    : capitalizeWords(group.name)}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={scrollToTop}
                  className="text-muted-foreground hover:text-primary"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {group.links.map((link) => (
                  <motion.div
                    key={`${group.name}-${link.number}`}
                    className="relative cursor-pointer"
                    onClick={(e) => handleImageClick(e, link, group.name)}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                      <img
                        src={`/attached_assets/facebook_posts_image/${categoryMappings[group.name]}/${link.number}.jpg`}
                        alt={`${group.name} session ${link.number}`}
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-300 ease-in-out"
                        loading="lazy"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/80 shadow-xl backdrop-blur-sm">
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full flex items-center justify-center p-4"
              onClick={() => setIsDialogOpen(false)}
            >
              <motion.img
                src={selectedImage.url}
                alt={`${selectedImage.groupName} session ${selectedImage.number}`}
                className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              />
              <button
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDialogOpen(false);
                }}
              >
                <ArrowUp className="h-6 w-6" />
              </button>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}