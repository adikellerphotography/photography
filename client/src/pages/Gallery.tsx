import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import PhotoGallery from "@/components/PhotoGallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Gallery() {
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
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

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !processedCategories) return;

    const currentTouch = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const diffX = touchStart - currentTouch;
    
    // Check if the swipe is more horizontal than vertical
    const element = e.currentTarget as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = element;
    const isAtTopEdge = scrollTop <= 0;
    const isAtBottomEdge = scrollTop + clientHeight >= scrollHeight;
    
    // Only handle horizontal swipes when at scroll boundaries
    if (Math.abs(diffX) > 50 && (isAtTopEdge || isAtBottomEdge)) {
      e.preventDefault(); // Prevent default only for horizontal swipes
      const currentIndex = processedCategories.findIndex(c => c.name === activeCategory);
      let newIndex = diffX > 0 ? currentIndex + 1 : currentIndex - 1;

      if (newIndex < 0) {
        newIndex = processedCategories.length - 1;
      } else if (newIndex >= processedCategories.length) {
        newIndex = 0;
      }

      const newCategory = processedCategories[newIndex].name;
      setActiveCategory(newCategory);
      const newUrl = `/gallery?category=${encodeURIComponent(newCategory)}`;
      window.history.pushState({ category: newCategory }, "", newUrl);
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  // Define the allowed categories in the correct order
  const allowedCategories = ["Bat Mitsva", "Family", "Horses", "Modeling", "Women", "Yoga", "Kids"];

  // Filter and sort categories, ensuring uniqueness
  const processedCategories = categories
    ?.filter((category, index, self) => 
      // Only include if it's in allowedCategories and it's the first occurrence
      allowedCategories.some(allowed => allowed.toLowerCase() === category.name.toLowerCase()) &&
      self.findIndex(c => c.name.toLowerCase() === category.name.toLowerCase()) === index
    )
    .sort((a, b) => {
      const aIndex = allowedCategories.findIndex(c => c.toLowerCase() === a.name.toLowerCase());
      const bIndex = allowedCategories.findIndex(c => c.toLowerCase() === b.name.toLowerCase());
      return aIndex - bIndex;
    }) || [];

  // Update active category when categories load or URL changes
  useEffect(() => {
    if (processedCategories.length > 0) {
      if (categoryFromUrl && processedCategories.some(c => c.name === categoryFromUrl)) {
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
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-muted rounded mb-8" />
            <div className="h-12 w-full bg-muted rounded mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pt-8"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4 py-16"
      >
        <div className="flex justify-between items-center mb-8">
          <motion.h1 variants={itemVariants} className="text-3xl font-bold text-[#FF9500]">
            Photo Gallery
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
              className="overflow-x-auto scrollbar-hide relative"
              onScroll={checkScroll}
              ref={tabsListRef}
            >
              <TabsList className="inline-flex min-w-full justify-start px-8 border-0">
                {processedCategories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.name}
                    className="min-w-[120px]"
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
              <TabsContent key={category.id} value={category.name}>
                <Card>
                  <CardContent className="pt-6">
                    <PhotoGallery category={category.name} />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </motion.div>
        </Tabs>
      </motion.div>
    </div>
  );
}