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
  const { data: categories, isLoading: categoriesLoading } = useQuery<
    Category[]
  >({
    queryKey: ["/api/categories"],
  });

  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const categoryFromUrl = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const tabsListRef = useRef<HTMLDivElement>(null);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null,
  );
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState<boolean | null>(
    null,
  );

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

    // Determine swipe direction on first significant movement
    if (
      isHorizontalSwipe === null &&
      (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)
    ) {
      setIsHorizontalSwipe(Math.abs(diffX) > Math.abs(diffY));
    }

    // Only handle horizontal swipes
    if (isHorizontalSwipe && Math.abs(diffX) > 50) {
      const currentIndex = processedCategories.findIndex(
        (c) => c.name === activeCategory,
      );
      let newIndex = diffX > 0 ? currentIndex + 1 : currentIndex - 1;

      if (newIndex < 0) {
        newIndex = processedCategories.length - 1;
      } else if (newIndex >= processedCategories.length) {
        newIndex = 0;
      }

      const newCategory = processedCategories[newIndex].name;
      setActiveCategory(newCategory);

      // Ensure tab visibility and synchronization
      if (tabsListRef.current) {
        const tabTrigger = tabsListRef.current.querySelector(
          `[value="${newCategory}"]`,
        ) as HTMLButtonElement;
        if (tabTrigger) {
          // Force tab activation
          tabTrigger.click();

          // Calculate scroll position to keep the active tab visible on the left
          const container = tabsListRef.current;
          const scrollLeft = Math.max(0, tabTrigger.offsetLeft - 16);

          // Smooth scroll with animation matching the swipe
          container.scrollTo({
            left: scrollLeft,
            behavior: "smooth",
          });

          // Update active state visually
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

  // Include all categories except specific ones
  const excludedCategories = ["Before And After"];
  const allowedCategories = categories
    ?.filter(cat => !excludedCategories.includes(cat.name))
    .map(cat => cat.name) || [];

  // Filter and sort categories, ensuring uniqueness
  const processedCategories =
    categories
      ?.filter(
        (category, index, self) =>
          // Only include if it's in allowedCategories and it's the first occurrence
          allowedCategories.some(
            (allowed) => allowed.toLowerCase() === category.name.toLowerCase(),
          ) &&
          self.findIndex(
            (c) => c.name.toLowerCase() === category.name.toLowerCase(),
          ) === index,
      )
      .sort((a, b) => {
        const aIndex = allowedCategories.findIndex(
          (c) => c.toLowerCase() === a.name.toLowerCase(),
        );
        const bIndex = allowedCategories.findIndex(
          (c) => c.toLowerCase() === b.name.toLowerCase(),
        );
        return aIndex - bIndex;
      }) || [];

  // Update active category when categories load or URL changes
  useEffect(() => {
    if (processedCategories.length > 0) {
      if (
        categoryFromUrl &&
        processedCategories.some((c) => c.name === categoryFromUrl)
      ) {
        setActiveCategory(categoryFromUrl);
      } else if (!activeCategory) {
        setActiveCategory(processedCategories[0].name);
        const newUrl = `/gallery?category=${encodeURIComponent(processedCategories[0].name)}`;
        window.history.replaceState(null, "", newUrl);
      }
    }
  }, [categoryFromUrl, processedCategories, activeCategory]);

  // Handle scroll visibility
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

  // Animation variants
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

  if (categoriesLoading || !processedCategories.length) {
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
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4 py-8"
      >
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            variants={itemVariants}
            className={`text-3xl font-bold text-[#FF9500] w-full ${language === "he" ? "text-right" : "text-left"}`}
          >
            {language === "he" ? "גלריית תמונות" : "Photo Gallery"}
          </motion.h1>
        </div>

        <Tabs
          value={activeCategory}
          onValueChange={(value) => {
            setActiveCategory(value);
            const newUrl = `/gallery?category=${encodeURIComponent(value)}`;
            window.history.pushState({ category: value }, "", newUrl);
          }}
          className="space-y-8"
        >
          <div className="relative">
            {showLeftScroll && (
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                onClick={() => scroll("left")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            <div
              className="overflow-x-auto scrollbar-hide relative scroll-smooth"
              onScroll={checkScroll}
              ref={tabsListRef}
            >
              <TabsList className="inline-flex min-w-full justify-start px-8 border-0 sticky left-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                {processedCategories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.name}
                    className="min-w-[120px] transition-all duration-300 ease-in-out data-[state=active]:bg-gray-100/10 rounded-md"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {showRightScroll && (
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                onClick={() => scroll("right")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          <motion.div variants={itemVariants}>
            {processedCategories.map((category) => (
              <TabsContent
                key={category.id}
                value={category.name}
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
                    x:
                      touchStartX && touchStartX - (currentX || 0) > 0
                        ? -300
                        : 300,
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
                      <PhotoGallery category={category.name} />
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            ))}
          </motion.div>
        </Tabs>
      </motion.div>
    </div>
  );
}