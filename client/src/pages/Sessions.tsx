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
    links: [
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid032zVU11kqanfNEap8Q3iuJrbqo7zHzYY5dzFE", number: 1 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02RvK1g9Z6Z4FyQX8YDNJYmw5JH2ViXNtL", number: 2 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0vWmNQ7D8tP9KhX3yGJ4ZqRsBn6wVXNtM", number: 3 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02YbL8k9M7T4NyPW8XDKJZnx6K3WiYOuN", number: 4 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid027cM9n8N8U5OyQW9YEKKAnx7L4XjZPvO", number: 5 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid03aD0o9O9V6PzRX0ZFLLBox8M5XkAAQwP", number: 6 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid04bE1p0P0W7QaSY1AGMMCpy9N6YlBBRxQ", number: 7 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid05cF2q1Q1X8RbTZ2BHNNDqz0N7ZmCCSyR", number: 8 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid06dG3r2R2Y9ScUA3CIOOErA1O8AnDDTzS", number: 9 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid07eH4s3S3Z0TdVB4DJPPFsB2P9BnEEUAT", number: 10 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid08fI5t4T4A1UeWC5EKQQGtC3Q0CoFFVBU", number: 11 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid09gJ6u5U5B2VfXD6FLRRHuD4R1DpGGWCV", number: 12 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid010hK7v6V6C3WgYE7GMSSIvE5S2EqHHXDW", number: 13 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid011iL8w7W7D4XhZF8HNTTJwF6T3FrIIYEX", number: 14 }
    ]
  },
  {
    name: "Horses",
    links: [
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02RvK1g9Z6Z4FyQX8YDNJYmw5JH2ViXNtL", number: 1 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid0vWmNQ7D8tP9KhX3yGJ4ZqRsBn6wVXNtM", number: 2 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid02YbL8k9M7T4NyPW8XDKJZnx6K3WiYOuN", number: 3 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid027cM9n8N8U5OyQW9YEKKAnx7L4XjZPvO", number: 4 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid03aD0o9O9V6PzRX0ZFLLBox8M5XkAAQwP", number: 5 },
      { url: "https://www.facebook.com/adi.keller.16/posts/pfbid04bE1p0P0W7QaSY1AGMMCpy9N6YlBBRxQ", number: 6 }
    ]
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
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
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
      const url = isMobile ? getFacebookUrl(link.url) : link.url;
      window.open(url, "_blank", "noopener,noreferrer");
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
            url: `/attached_assets/facebook_posts_image/${groupName.replace(/\s+/g, '_')}/${link.number}.jpg`,
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

        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b mb-8 py-3">
          <div className="container max-w-5xl mx-auto">
            <div className="flex flex-wrap justify-center gap-1.5">
              {groups.map((group) => (
                <Button
                  key={group.name}
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToGroup(group.name)}
                  className={`text-xs font-medium px-3 py-1.5 h-7 rounded-full transition-colors duration-200 ${
                    groupRefs.current[group.name] && 
                    groupRefs.current[group.name].getBoundingClientRect().top <= 120 &&
                    groupRefs.current[group.name].getBoundingClientRect().bottom >= 120
                      ? 'bg-[#FF9500] !text-black font-semibold hover:!bg-[#FF9500] active:!bg-[#FF9500]'
                      : 'hover:bg-primary/10'
                  }`}
                >
                  {language === "he"
                    ? t(`sessions.${group.name}`)
                    : capitalizeWords(group.name)}
                </Button>
              ))}
            </div>
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
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {group.links.map((link) => (
                  <motion.div
                    key={`${group.name}-${link.number}`}
                    className="relative cursor-pointer px-1 sm:px-0"
                    onClick={(e) => handleImageClick(e, link, group.name)}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                      <img
                        src={`/attached_assets/facebook_posts_image/${group.name.replace(/\s+/g, '_')}/${link.number}.jpg`}
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