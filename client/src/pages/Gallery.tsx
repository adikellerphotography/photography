import { FC, useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useTranslation } from "@/hooks/use-translation";
import PhotoGallery from "@/components/PhotoGallery";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { Category, Photo } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";


const Gallery: FC = () => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  
  // Define category order at the top level
  const excludedCategories = ["before_and_after", "facebook_posts_image"];
  const categoryOrder = [
    "Bat Mitsva",
    "Horses",
    "Family",
    "Kids",
    "Femininity", 
    "Yoga",
    "Modeling",
    "Intimate"
  ];

  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const categoryFromUrl = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState<string>(categoryFromUrl || "");
  
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/photography/attached_assets/categories.json"],
    queryFn: async () => {
      const response = await fetch("/photography/attached_assets/categories.json");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      return data;
    },
  });

  const processedCategories = categories
    ?.filter(
      (category) =>
        !excludedCategories.includes(category.name.toLowerCase()) &&
        categoryOrder.includes(category.name)
    )
    .sort((a, b) => 
      categoryOrder.indexOf(a.name) - categoryOrder.indexOf(b.name)
    ) || [];

  // Set default category when categories are loaded
  useEffect(() => {
    if (!categoriesLoading && processedCategories.length > 0) {
      if (categoryFromUrl && processedCategories.some(c => c.name === categoryFromUrl)) {
        // If URL has a valid category, use it
        setActiveCategory(categoryFromUrl);
      } else {
        // If no valid category in URL, use first category
        const defaultCategory = processedCategories[0].name;
        setActiveCategory(defaultCategory);
        // Update URL to include the default category
        const newUrl = `/gallery?category=${encodeURIComponent(defaultCategory)}`;
        window.history.replaceState({ category: defaultCategory }, "", newUrl);
      }
    }
  }, [categoriesLoading, processedCategories, categoryFromUrl]);

  // Fetch photos for active category
  const { data: photos = [], isLoading: photosLoading } = useQuery<Photo[]>({
    queryKey: ["/photography/attached_assets/galleries", activeCategory],
    queryFn: async () => {
      if (!activeCategory) return [];
      try {
        const formattedCategory = activeCategory.replace(/\s+/g, '_');
        const response = await fetch(`/photography/attached_assets/galleries/${formattedCategory}/photos.json`);
        if (!response.ok) {
          console.error(`Failed to fetch photos for ${activeCategory}`);
          return [];
        }
        const data = await response.json();
        return data.map((photo: Photo) => ({
          ...photo,
          imageUrl: photo.imageUrl.startsWith('http') ? photo.imageUrl : 
                   photo.imageUrl.startsWith('/photography') ? photo.imageUrl : 
                   `/photography${photo.imageUrl}`,
          thumbnailUrl: photo.thumbnailUrl ? 
                       (photo.thumbnailUrl.startsWith('http') ? photo.thumbnailUrl : 
                        photo.thumbnailUrl.startsWith('/photography') ? photo.thumbnailUrl : 
                        `/photography${photo.thumbnailUrl}`) :
                       photo.imageUrl
        }));
      } catch (error) {
        console.error('Error loading photos:', error);
        return [];
      }
    },
    enabled: !!activeCategory,
  });

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

  const scrollY = window.scrollY;
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  if (categoriesLoading || !processedCategories.length || photosLoading) {
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
    <div className="min-h-screen pt-16 overflow-x-hidden">
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
                  {language === 'he' ? t(`categories.${category.name}`) : category.name}
                </Button>
              ))}
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 pt-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mb-4"
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
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="relative"
                >
                  <motion.div
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{
                      opacity: 0,
                      x: -300,
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
                        <PhotoGallery 
                          category={category.name} 
                          photos={photos.filter((photo: Photo) => photo && photo.imageUrl)} 
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              )
            ))}
          </AnimatePresence>
          </motion.div>
        </div>
        <motion.button
          className={`fixed bottom-6 right-6 p-3 rounded-full bg-[#FF9500] text-black shadow-lg transition-all ${
            scrollY > 200 ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
          onClick={scrollToTop}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
    </div>
  );
}

export default Gallery;