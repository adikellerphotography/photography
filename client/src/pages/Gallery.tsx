import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import PhotoGallery from "@/components/PhotoGallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/lib/types";

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="min-h-screen pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <h1 className="text-3xl font-bold mb-8">Photo Gallery</h1>
        
        <Tabs defaultValue="all" onValueChange={setActiveCategory}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {categories?.map((category) => (
              <TabsTrigger key={category.id} value={category.name}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <PhotoGallery />
          </TabsContent>

          {categories?.map((category) => (
            <TabsContent key={category.id} value={category.name}>
              <PhotoGallery category={category.name} />
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </div>
  );
}
