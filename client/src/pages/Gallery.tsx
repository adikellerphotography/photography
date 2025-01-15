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
  const { data: categories, isLoading: categoriesLoading } = useQuery<
    Category[]
  >({
    queryKey: ["/api/categories"],
  });

  // Get category from URL search params
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const categoryFromUrl = searchParams.get("category");

  // Set the initial category from URL or first available category
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const tabsListRef = useRef<HTMLDivElement>(null);

  // Update active category when categories load or URL changes
  useEffect(() => {
    const filteredCategories = categories?.filter((category) => {
      const lowerName = category.name.toLowerCase();
      // Exclude 'before and after'
      if (lowerName === "before and after") return false;
      return true;
    });
    if (filteredCategories && filteredCategories.length > 0) {
      // If we have a category from URL and it exists in our categories, use it
      if (
        categoryFromUrl &&
        filteredCategories.some((c) => c.name === categoryFromUrl)
      ) {
        setActiveCategory(categoryFromUrl);
      }
      // Otherwise use the first category
      else if (!activeCategory) {
        setActiveCategory(filteredCategories[0].name);
        // Update URL without triggering navigation
        const newUrl = `/gallery?category=${encodeURIComponent(filteredCategories[0].name)}`;
        window.history.replaceState(null, "", newUrl);
      }
    }
  }, [categoryFromUrl, categories, activeCategory]);

  // Check scroll shadows visibility
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

  const handleScroll = () => {
    checkScroll();
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

  if (categoriesLoading || !categories || categories.length === 0) {
    return (
      <div className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-muted rounded mb-8" />
            <div className="h-12 w-full bg-muted rounded mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allowedCategories = ["Bat Mitsva", "Family", "Women", "Kids", "Yoga", "Modeling"];
  
  const filteredCategories = categories?.filter(
    (category) => allowedCategories.includes(category.name)
  ) || [];

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    return allowedCategories.indexOf(a.name) - allowedCategories.indexOf(b.name);
  });

  return (
    <div className="min-h-screen pt-16">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4 py-16"
      >
        <motion.h1 variants={itemVariants} className="text-3xl font-bold mb-8">
          Photo Gallery
        </motion.h1>

        <Tabs
          value={activeCategory}
          onValueChange={(value) => {
            setActiveCategory(value);
            // Update URL with proper history state
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
              onScroll={handleScroll}
              ref={tabsListRef}
            >
              <TabsList className="inline-flex min-w-full justify-start px-8 border-0">
                {sortedCategories.map((category) => (
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
            {sortedCategories.map((category) => (
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