import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import PhotoGallery from "@/components/PhotoGallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

export default function Gallery() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Set the first category as default if available
  const defaultCategory = categories?.[0]?.name;
  const [activeCategory, setActiveCategory] = useState<string>(defaultCategory || '');

  // Update active category when categories load
  useEffect(() => {
    if (defaultCategory && !activeCategory) {
      setActiveCategory(defaultCategory);
    }
  }, [defaultCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-muted rounded mb-8" />
            <div className="h-12 w-full bg-muted rounded mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4 py-16"
      >
        <motion.h1 
          variants={itemVariants}
          className="text-3xl font-bold mb-8"
        >
          Photo Gallery
        </motion.h1>

        <Tabs 
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="space-y-8"
        >
          <TabsList className="flex flex-wrap gap-2">
            {categories?.map((category) => (
              <TabsTrigger key={category.id} value={category.name}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <motion.div variants={itemVariants}>
            {categories?.map((category) => (
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