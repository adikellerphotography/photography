import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import PhotoGallery from "@/components/PhotoGallery";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Gallery() {
  const { language } = useLanguage();
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const categoryFromUrl = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const tabsListRef = useRef<HTMLDivElement>(null);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState<boolean | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const x = e.touches[0].clientX;
    setTouchStartX(x);
    setCurrentX(x);
    setTouchStartY(e.touches[0].clientY);
    setIsHorizontalSwipe(null);
    setSwipeDirection(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[role="dialog"]')) return;
    if (!touchStartX || !touchStartY || !processedCategories) return;

    const x = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = touchStartX - x;
    const diffY = touchStartY - currentY;

    setCurrentX(x);
    setSwipeDirection(diffX > 0 ? "left" : "right");

    if (isHorizontalSwipe === null && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
      setIsHorizontalSwipe(Math.abs(diffX) > Math.abs(diffY));
    }

    if (isHorizontalSwipe && Math.abs(diffX) > 50) {
      const currentIndex = processedCategories.findIndex(
        (c) => c.name === activeCategory
      );
      let newIndex = diffX > 0 ? currentIndex + 1 : currentIndex - 1;

      if (newIndex < 0) {
        newIndex = processedCategories.length - 1;
      } else if (newIndex >= processedCategories.length) {
        newIndex = 0;
      }

      const newCategory = processedCategories[newIndex].name;
      setActiveCategory(newCategory);

      if (tabsListRef.current) {
        const tabTrigger = tabsListRef.current.querySelector(
          `[value="${newCategory}"]`
        ) as HTMLButtonElement;

        if (tabTrigger) {
          tabTrigger.click();
          const container = tabsListRef.current;
          const scrollLeft = Math.max(0, tabTrigger.offsetLeft - 16);

          container.scrollTo({
            left: scrollLeft,
            behavior: "smooth",
          });

          const allTriggers = container.querySelectorAll('[role="tab"]');
          allTriggers.forEach((trigger) => {
            trigger.setAttribute("aria-selected", "false");
            trigger.classList.remove("bg-gray-100/10");
          });
          tabTrigger.setAttribute("aria-selected", "true");
          tabTrigger.classList.add("bg-gray-100/10");
        }
      }

      const newUrl = `/gallery?category=${encodeURIComponent(newCategory)}`;
      window.history.pushState({ category: newCategory }, "", newUrl);
      setTouchStartX(null);
      setTouchStartY(null);
      setIsHorizontalSwipe(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
    setTouchStartY(null);
    setIsHorizontalSwipe(null);
  };

  const excludedCategories = ["before_and_after", "facebook_posts_image"];
  const categoryOrder = [
    "Bat Mitsva",
    "Horses",
    "Kids",
    "Femininity", 
    "Yoga",
    "Modeling",
    "Artful Nude"
  ];

  const processedCategories = categories
    ?.filter(
      (category, index, self) =>
        !excludedCategories.includes(category.name.toLowerCase()) &&
        categoryOrder.includes(category.name) &&
        self.findIndex(
          (c) => c.name.toLowerCase() === category.name.toLowerCase()
        ) === index
    )
    .sort((a, b) => 
      categoryOrder.indexOf(a.name) - categoryOrder.indexOf(b.name)
    ) || [];

  useEffect(() => {
    if (processedCategories.length > 0) {
      if (categoryFromUrl && processedCategories.some((c) => c.name === categoryFromUrl)) {
        setActiveCategory(categoryFromUrl);
      } else if (!activeCategory) {
        setActiveCategory(processedCategories[0].name);
        const newUrl = `/gallery?category=${encodeURIComponent(
          processedCategories[0].name
        )}`;
        window.history.replaceState(null, "", newUrl);
      }
    }
  }, [categoryFromUrl, processedCategories, activeCategory]);

  const checkScroll = () => {
    if (tabsListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsListRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    if (tabsListRef.current) {
      const scrollAmount = 200;
      tabsListRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const { data: photos = [], isLoading, refetch } = useQuery<Photo[]>({
    queryKey: ["/api/photos", activeCategory],
    queryFn: async () => {
      const response = await fetch(`/api/photos?category=${encodeURIComponent(activeCategory)}`);
      if (!response.ok) throw new Error('Failed to fetch photos');
      const data = await response.json();
      const filteredPhotos = data.filter((photo: Photo) => photo && photo.imageUrl);

      // Shuffle photos only once when fetched
      for (let i = filteredPhotos.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredPhotos[i], filteredPhotos[j]] = [filteredPhotos[j], filteredPhotos[i]];
      }

      return filteredPhotos;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
  });


  if (categoriesLoading || !processedCategories.length || isLoading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: i * 0.1,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                >
                  <div className="relative overflow-hidden rounded-lg bg-muted/30">
                    <AspectRatio ratio={1.5}>
                      <div
                        className="absolute inset-0 bg-muted/30 animate-pulse"
                        style={{
                          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                        }}
                      />
                    </AspectRatio>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-16 overflow-x-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <nav className="fixed top-[60px] w-full z-[100] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b py-3">
          <div className="container max-w-5xl mx-auto">
            <div className="flex flex-wrap justify-center gap-1.5">
              {processedCategories.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveCategory(category.name);
                    const newUrl = `/gallery?category=${encodeURIComponent(category.name)}`;
                    window.history.pushState({ category: category.name }, "", newUrl);
                    window.scrollTo({ 
                      top: 0,
                      behavior: 'smooth'
                    });
                  }}
                  className={`text-xs font-medium px-3 py-1.5 h-7 rounded-full transition-all duration-75 ${
                    activeCategory === category.name ? 'bg-[#FF9500] !text-black font-semibold hover:bg-[#FF9500] active:bg-[#FF9500]' : 'hover:bg-primary/10'
                  }`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 pt-28">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mb-8"
          >
            <div className="flex justify-between items-center">
              <motion.h1
                variants={itemVariants}
                className="text-2xl font-bold text-[#FF9500] w-full text-center"
              >
                {language === "he" ? "גלריית תמונות" : "Photo Gallery"}
              </motion.h1>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >

          <AnimatePresence mode="wait">
            {processedCategories.map((category) => (
              category.name === activeCategory && (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: swipeDirection === "left" ? 300 : -300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: swipeDirection === "left" ? -300 : 300 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="relative"
                >
                <motion.div
                  initial={{
                    opacity: 0,
                    x: swipeDirection === "left" ? 300 : -300,
                  }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{
                    opacity: 0,
                    x: touchStartX && touchStartX - (currentX || 0) > 0 ? -300 : 300,
                    transition: {
                      duration: 0.2,
                    },
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 25,
                    mass: 1,
                  }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <PhotoGallery category={category.name} photos={photos} />
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
              )
            ))}
          </AnimatePresence>
          </motion.div>
        </div>
    </div>
  );
}