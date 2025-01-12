import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import PhotoGallery from "@/components/PhotoGallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

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
          defaultValue="all" 
          onValueChange={setActiveCategory}
          className="space-y-8"
        >
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories?.map((category) => (
              <TabsTrigger key={category.id} value={category.name}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <motion.div variants={itemVariants}>
            <TabsContent value="all">
              <Card>
                <CardContent className="pt-6">
                  <PhotoGallery />
                </CardContent>
              </Card>
            </TabsContent>

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